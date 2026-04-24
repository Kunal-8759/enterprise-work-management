import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for seeding...");

    // ── Clean existing data ──────────────────────────────────────────
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});
    console.log("Existing data cleared");

    // ── Create Users ─────────────────────────────────────────────────

    const admin = await User.create({
      name: "Root Admin",
      email: "admin@ewms.com",
      password: "admin@123",
      role: "Admin",
      status: "Active",
    });

    const manager = await User.create({
      name: "Root Manager",
      email: "manager@ewms.com",
      password: "manager@123",
      role: "Manager",
      status: "Active",
    });

    const employee = await User.create({
      name: "Root Employee",
      email: "employee@ewms.com",
      password: "employee@123",
      role: "Employee",
      status: "Active",
    });

    console.log("Users created");

    // ── Create Projects ───────────────────────────────────────────────
    const project1 = await Project.create({
      title: "Enterprise WMS Platform",
      description: "Build a full-stack enterprise work management system with React and Node.js.",
      status: "active",
      priority: "high",
      deadline: new Date("2025-06-30"),
      createdBy: admin._id,
      members: [admin._id, manager._id, employee._id],
    });

    const project2 = await Project.create({
      title: "Mobile App Redesign",
      description: "Redesign the mobile application UI for better user experience.",
      status: "planning",
      priority: "medium",
      deadline: new Date("2025-08-15"),
      createdBy: manager._id,
      members: [manager._id, employee._id],
    });

    const project3 = await Project.create({
      title: "API Gateway Migration",
      description: "Migrate existing REST APIs to a unified API gateway architecture.",
      status: "on-hold",
      priority: "low",
      deadline: new Date("2025-09-01"),
      createdBy: admin._id,
      members: [admin._id, manager._id],
    });

    console.log("Projects created");

    // ── Create Tasks ──────────────────────────────────────────────────
    const task1 = await Task.create({
      title: "Setup Authentication Module",
      description: "Implement JWT based authentication with role based access control.",
      type: "feature",
      status: "done",
      priority: "high",
      dueDate: new Date("2025-04-10"),
      project: project1._id,
      createdBy: admin._id,
      assignee: manager._id,
      comments: [
        {
          text: "Authentication module completed and tested successfully.",
          commentedBy: manager._id,
        },
      ],
    });

    const task2 = await Task.create({
      title: "Build Kanban Board",
      description: "Implement drag and drop Kanban board for task management.",
      type: "feature",
      status: "in-progress",
      priority: "high",
      dueDate: new Date("2025-05-01"),
      project: project1._id,
      createdBy: admin._id,
      assignee: employee._id,
      comments: [
        {
          text: "Started working on the drag and drop functionality.",
          commentedBy: employee._id,
        },
        {
          text: "Please use react-beautiful-dnd for this.",
          commentedBy: manager._id,
        },
      ],
    });

    const task3 = await Task.create({
      title: "Fix Dashboard Loading Bug",
      description: "Dashboard metrics are not loading correctly on first render.",
      type: "bug",
      status: "todo",
      priority: "medium",
      dueDate: new Date("2025-04-25"),
      project: project1._id,
      createdBy: manager._id,
      assignee: employee._id,
    });

    const task4 = await Task.create({
      title: "Design New Onboarding Flow",
      description: "Create wireframes and prototypes for the new user onboarding experience.",
      type: "improvement",
      status: "todo",
      priority: "medium",
      dueDate: new Date("2025-05-15"),
      project: project2._id,
      createdBy: manager._id,
      assignee: manager._id,
    });

    const task5 = await Task.create({
      title: "API Gateway Research",
      description: "Research available API gateway solutions and create comparison report.",
      type: "improvement",
      status: "todo",
      priority: "low",
      dueDate: new Date("2025-06-01"),
      project: project3._id,
      createdBy: admin._id,
      assignee: manager._id,
    });

    console.log("Tasks created");

    // ── Create Notifications ──────────────────────────────────────────
    await Notification.create([
      {
        recipient: manager._id,
        sender: admin._id,
        type: "task_assigned",
        message: `You have been assigned a new task: ${task1.title}`,
        reference: task1._id,
        referenceModel: "Task",
        read: true,
      },
      {
        recipient: employee._id,
        sender: admin._id,
        type: "task_assigned",
        message: `You have been assigned a new task: ${task2.title}`,
        reference: task2._id,
        referenceModel: "Task",
        read: false,
      },
      {
        recipient: employee._id,
        sender: manager._id,
        type: "task_assigned",
        message: `You have been assigned a new task: ${task3.title}`,
        reference: task3._id,
        referenceModel: "Task",
        read: false,
      },
      {
        recipient: admin._id,
        sender: manager._id,
        type: "comment_added",
        message: `New comment added on task: "${task1.title}"`,
        reference: task1._id,
        referenceModel: "Task",
        read: false,
      },
      {
        recipient: admin._id,
        sender: employee._id,
        type: "comment_added",
        message: `New comment added on task: "${task2.title}"`,
        reference: task2._id,
        referenceModel: "Task",
        read: false,
      },
      {
        recipient: manager._id,
        sender: admin._id,
        type: "member_added",
        message: `You have been added to project: "${project1.title}"`,
        reference: project1._id,
        referenceModel: "Project",
        read: true,
      },
      {
        recipient: employee._id,
        sender: admin._id,
        type: "member_added",
        message: `You have been added to project: "${project1.title}"`,
        reference: project1._id,
        referenceModel: "Project",
        read: false,
      },
      {
        recipient: employee._id,
        sender: manager._id,
        type: "member_added",
        message: `You have been added to project: "${project2.title}"`,
        reference: project2._id,
        referenceModel: "Project",
        read: false,
      },
      {
        recipient: admin._id,
        sender: employee._id,
        type: "task_status_changed",
        message: `Task "${task2.title}" status changed to in-progress`,
        reference: task2._id,
        referenceModel: "Task",
        read: false,
      },
    ]);

    console.log("Notifications created");

    // ── Summary ───────────────────────────────────────────────────────
    console.log("\n✅ Seeding completed successfully");
    console.log("─────────────────────────────────");
    console.log("👤 Admin    → admin@ewms.com     / admin@123");
    console.log("👤 Manager  → manager@ewms.com   / manager@123");
    console.log("👤 Employee → employee@ewms.com  / employee@123");
    console.log("─────────────────────────────────");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();