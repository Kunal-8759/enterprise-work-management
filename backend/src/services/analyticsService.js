import { StatusCodes } from "http-status-codes";
import {
  findAllTasksForAnalytics,
  findAllProjectsForAnalytics,
  findAllUsersForAnalytics,
  getProjectsByManager,
} from "../repositories/analyticsRepository.js";

const TaskStatuses = ["todo", "in-progress", "done"];
const TaskPriorities = ["low", "medium", "high", "urgent"];
const TaskTypes = ["bug", "feature", "improvement"];
const ProjectStatuses = ["planning", "active", "on-hold", "completed"];
const ProjectPriorities = ["low", "medium", "high"];
const UserRoles = ["Admin", "Manager", "Employee"];


// Helper to get last 6 months range for trend chart
const getLast6MonthsRange = () => {
  const months = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    const year = month.getFullYear();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
    months.push({
      month: `${monthName} ${year}`,
      start: month,
      end: nextMonth
    });
  }
  return months;
};

export const getAnalyticsOverviewService = async (user, query = {}) => {
  try {
    const { startDate, endDate } = query;
    const userRole = user.role?.toLowerCase();
    const userId = user._id;

    //  1. Determine data scope based on role 
    let projectFilter = {};
    let taskFilter = {};
    let userFilter = { status: "Active" };

    if (userRole === "Manager") {
      const managedProjects = await getProjectsByManager(userId);
      const projectIds = managedProjects.map(p => p._id);
      projectFilter = { _id: { $in: projectIds } };
      taskFilter = { project: { $in: projectIds } };
      
      const allMembers = managedProjects.flatMap(p => p.members || []);
      const uniqueMemberIds = [...new Set(allMembers.map(id => id.toString()))];
      if (uniqueMemberIds.length > 0) {
        userFilter = { _id: { $in: uniqueMemberIds }, status: "Active" };
      }
    }

    // Apply date filter if provided
    if (startDate && endDate) {
      const dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
      taskFilter = { ...taskFilter, ...dateFilter };
    }

    //  2. Fetch data 
    const [allProjects, allTasks, allUsers] = await Promise.all([
      findAllProjectsForAnalytics(projectFilter),
      findAllTasksForAnalytics(taskFilter),
      findAllUsersForAnalytics(userFilter)
    ]);

    //  3. Summary Stats 
    const totalProjects = allProjects.length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === "done").length;
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
    ).length;
    const overallCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    //  4. Task Completion Trend 
    const months = getLast6MonthsRange();
    const completionTrend = months.map(({ month, start, end }) => {
      const completedInMonth = allTasks.filter(t => 
        t.status === "done" && t.updatedAt >= start && t.updatedAt < end
      ).length;
      const createdInMonth = allTasks.filter(t => 
        t.createdAt >= start && t.createdAt < end
      ).length;
      const inProgressInMonth = allTasks.filter(t => 
        t.status === "in-progress" && t.updatedAt >= start && t.updatedAt < end
      ).length;
      
      return { 
        month, 
        completed: completedInMonth, 
        created: createdInMonth, 
        inProgress: inProgressInMonth 
      };
    });

    //  5. Status Distribution 
    const statusDistribution = {};
    TaskStatuses.forEach(status => {
      const key = status === "in-progress" ? "inProgress" : status;
      statusDistribution[key] = allTasks.filter(t => t.status === status).length;
    });

    //  6. Priority Distribution 
    const priorityDistribution = {};
    TaskPriorities.forEach(priority => {
      priorityDistribution[priority] = allTasks.filter(t => t.priority === priority).length;
    });

    //  7. Projects by Status Distribution 
    const projectStatusDistribution = {};
    ProjectStatuses.forEach(status => {
      const key = status === "on-hold" ? "onHold" : status;
      projectStatusDistribution[key] = allProjects.filter(p => p.status === status).length;
    });

   //  8. Project Metrics 
 const projectMetrics = allProjects
    .map(project => {
        const projectTasks = allTasks.filter(t => {
        const taskProjectId = t.project?._id || t.project;
            return taskProjectId?.toString() === project._id.toString();
        });
        const total = projectTasks.length;
        const completed = projectTasks.filter(t => t.status === "done").length;
        const inProgress = projectTasks.filter(t => t.status === "in-progress").length;
        const todo = projectTasks.filter(t => t.status === "todo").length;
        const overdue = projectTasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
        ).length;
        const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        let health = "good";
        if (overdue > 3 || completionRate < 30) health = "critical";
        else if (overdue > 0 || completionRate < 60) health = "at-risk";
        
        console.log(`Project: ${project.title}`, {  // ← Debug log
        total,
        completed,
        completionRate,
        health
        });
        
        return {
        projectId: project._id,
        projectName: project.title,  
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        todoTasks: todo,
        completionRate,
        overdueTasks: overdue,
        health
        };
    })
    .filter(p => p.totalTasks > 0);

    //  9. Team Workload Distribution (FIXED) 
    const workload = [];

    // Get unique assignee IDs from tasks
    const uniqueAssigneeIds = [...new Set(
      allTasks
        .filter(t => t.assignee)
        .map(t => t.assignee.toString())
    )];

    // Also get project members
    const projectMemberIds = [...new Set(
      allProjects.flatMap(p => p.members?.map(m => m.toString()) || [])
    )];

    // Combine and get unique user IDs
    const allRelevantUserIds = [...new Set([...uniqueAssigneeIds, ...projectMemberIds])];

    // Filter users who are relevant
    const relevantUsers = allUsers.filter(u => 
      allRelevantUserIds.includes(u._id.toString())
    );

    console.log("Workload Debug:", {
      totalTasks: allTasks.length,
      tasksWithAssignee: allTasks.filter(t => t.assignee).length,
      uniqueAssigneeIds,
      relevantUsersCount: relevantUsers.length
    });

    for (const user of relevantUsers) {
      const userTasks = allTasks.filter(t => 
        t.assignee && t.assignee.toString() === user._id.toString()
      );
      const assigned = userTasks.length;
      const completed = userTasks.filter(t => t.status === "done").length;
      const inProgress = userTasks.filter(t => t.status === "in-progress").length;
      const completionRate = assigned === 0 ? 0 : Math.round((completed / assigned) * 100);
      
      workload.push({
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        assignedTasks: assigned,
        completedTasks: completed,
        inProgressTasks: inProgress,
        completionRate
      });
    }

    // Sort by assigned tasks (descending)
    workload.sort((a, b) => b.assignedTasks - a.assignedTasks);

    return {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Analytics data fetched successfully",
      data: {
        summary: {
          totalProjects,
          totalTasks,
          completedTasks,
          overdueTasks,
          overallCompletionRate
        },
        completionTrend,
        statusDistribution,
        priorityDistribution,
        projectStatusDistribution,
        projectMetrics,
        workload
      }
    };
  } catch (error) {
    console.error("Analytics Service Error:", error);
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message
    };
  }
};

export const exportAnalyticsCsvService = async (user, query = {}) => {
  try {
    const result = await getAnalyticsOverviewService(user, query);
    if (!result.success) return result;
    
    const { projectMetrics, summary } = result.data;
    
    let csv = "Project Name,Total Tasks,Completed Tasks,In Progress,Todo,Completion Rate,Overdue Tasks,Health\n";
    
    projectMetrics.forEach(project => {
      csv += `"${project.projectName}",${project.totalTasks},${project.completedTasks},${project.inProgressTasks},${project.todoTasks},${project.completionRate}%,${project.overdueTasks},${project.health}\n`;
    });
    
    csv += "\n--- Summary ---\n";
    csv += `Total Projects,${summary.totalProjects}\n`;
    csv += `Total Tasks,${summary.totalTasks}\n`;
    csv += `Completed Tasks,${summary.completedTasks}\n`;
    csv += `Overdue Tasks,${summary.overdueTasks}\n`;
    csv += `Overall Completion Rate,${summary.overallCompletionRate}%\n`;
    csv += `\nGenerated on,${new Date().toLocaleString()}\n`;
    
    return {
      statusCode: StatusCodes.OK,
      success: true,
      message: "CSV exported successfully",
      data: { csv }
    };
  } catch (error) {
    console.error("CSV Export Error:", error);
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Failed to export CSV",
      error: error.message
    };
  }
};