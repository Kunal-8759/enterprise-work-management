import taskReducer, {
  clearSelectedTask,
  clearTaskError,
  updateTaskStatusLocally,
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
  uploadAttachment,
  deleteAttachment,
} from "../../store/slices/taskSlice.js";

jest.mock("../../services/api.js", () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    post:   jest.fn(),
    put:    jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request:  { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}));

//  helpers 
const pending   = (thunk)          => ({ type: thunk.pending.type });
const fulfilled = (thunk, payload) => ({ type: thunk.fulfilled.type, payload });
const rejected  = (thunk, payload) => ({ type: thunk.rejected.type, payload });

const makeTask = (overrides = {}) => ({
  _id: "t1",
  title: "Setup CI pipeline",
  type: "feature",
  priority: "high",
  status: "todo",
  comments: [],
  attachments: [],
  ...overrides,
});

const initialState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  detailLoading: false,
  error: null,
};

//  Initial state 
describe("taskSlice — initial state", () => {
  it("returns the correct initial state", () => {
    const state = taskReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual(initialState);
  });
});

//  Synchronous reducers 
describe("taskSlice — clearSelectedTask", () => {
  it("sets selectedTask to null", () => {
    const state = taskReducer(
      { ...initialState, selectedTask: makeTask() },
      clearSelectedTask()
    );
    expect(state.selectedTask).toBeNull();
  });
});

describe("taskSlice — clearTaskError", () => {
  it("sets error to null", () => {
    const state = taskReducer(
      { ...initialState, error: "Some error" },
      clearTaskError()
    );
    expect(state.error).toBeNull();
  });
});

describe("taskSlice — updateTaskStatusLocally", () => {
  it("updates the status of the matching task", () => {
    const task = makeTask({ _id: "t1", status: "todo" });
    const state = taskReducer(
      { ...initialState, tasks: [task] },
      updateTaskStatusLocally({ taskId: "t1", status: "in_progress" })
    );
    expect(state.tasks[0].status).toBe("in_progress");
  });

  it("does not affect other tasks in the list", () => {
    const tasks = [
      makeTask({ _id: "t1", status: "todo" }),
      makeTask({ _id: "t2", status: "todo" }),
    ];
    const state = taskReducer(
      { ...initialState, tasks },
      updateTaskStatusLocally({ taskId: "t1", status: "done" })
    );
    expect(state.tasks[1].status).toBe("todo");
  });

  it("does nothing when taskId does not match any task", () => {
    const task = makeTask({ _id: "t1", status: "todo" });
    const state = taskReducer(
      { ...initialState, tasks: [task] },
      updateTaskStatusLocally({ taskId: "ghost", status: "done" })
    );
    expect(state.tasks[0].status).toBe("todo");
  });

  it("allows all valid status transitions", () => {
    const statuses = ["todo", "in_progress", "in_review", "done"];
    statuses.forEach((status) => {
      const task = makeTask({ _id: "t1" });
      const state = taskReducer(
        { ...initialState, tasks: [task] },
        updateTaskStatusLocally({ taskId: "t1", status })
      );
      expect(state.tasks[0].status).toBe(status);
    });
  });
});

//  fetchTasks 
describe("taskSlice — fetchTasks", () => {
  it("pending: sets loading=true and clears error", () => {
    const state = taskReducer(
      { ...initialState, error: "old error" },
      pending(fetchTasks)
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fulfilled: stores tasks array and sets loading=false", () => {
    const tasks = [makeTask({ _id: "t1" }), makeTask({ _id: "t2" })];
    const state = taskReducer(
      { ...initialState, loading: true },
      fulfilled(fetchTasks, tasks)
    );
    expect(state.loading).toBe(false);
    expect(state.tasks).toHaveLength(2);
  });

  it("rejected: stores error and sets loading=false", () => {
    const state = taskReducer(
      { ...initialState, loading: true },
      rejected(fetchTasks, "Failed to fetch tasks")
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch tasks");
  });
});

//  fetchTaskById   
describe("taskSlice — fetchTaskById", () => {
  it("pending: sets detailLoading=true", () => {
    const state = taskReducer(initialState, pending(fetchTaskById));
    expect(state.detailLoading).toBe(true);
  });

  it("fulfilled: sets selectedTask and detailLoading=false", () => {
    const task = makeTask({ _id: "t1" });
    const state = taskReducer(
      { ...initialState, detailLoading: true },
      fulfilled(fetchTaskById, task)
    );
    expect(state.detailLoading).toBe(false);
    expect(state.selectedTask).toEqual(task);
  });

  it("rejected: stores error and sets detailLoading=false", () => {
    const state = taskReducer(
      { ...initialState, detailLoading: true },
      rejected(fetchTaskById, "Failed to fetch task")
    );
    expect(state.detailLoading).toBe(false);
    expect(state.error).toBe("Failed to fetch task");
  });
});

//  createTask  
describe("taskSlice — createTask", () => {
  it("fulfilled: prepends new task to the front of the list", () => {
    const existing = makeTask({ _id: "t0", title: "Old Task" });
    const created  = makeTask({ _id: "t1", title: "New Task" });
    const state = taskReducer(
      { ...initialState, tasks: [existing] },
      fulfilled(createTask, created)
    );
    expect(state.tasks[0]).toEqual(created);
    expect(state.tasks[1]).toEqual(existing);
  });

  it("fulfilled: works on an empty list", () => {
    const created = makeTask({ _id: "t1" });
    const state = taskReducer(initialState, fulfilled(createTask, created));
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0]._id).toBe("t1");
  });
});

//   updateTask   
describe("taskSlice — updateTask", () => {
  it("fulfilled: replaces the matching task in the list", () => {
    const original = makeTask({ _id: "t1", title: "Old" });
    const updated  = makeTask({ _id: "t1", title: "Updated" });
    const state = taskReducer(
      { ...initialState, tasks: [original] },
      fulfilled(updateTask, updated)
    );
    expect(state.tasks[0].title).toBe("Updated");
  });

  it("fulfilled: also updates selectedTask when ids match", () => {
    const task    = makeTask({ _id: "t1", title: "Old" });
    const updated = makeTask({ _id: "t1", title: "Updated" });
    const state = taskReducer(
      { ...initialState, tasks: [task], selectedTask: task },
      fulfilled(updateTask, updated)
    );
    expect(state.selectedTask.title).toBe("Updated");
  });

  it("fulfilled: does NOT update selectedTask when ids don't match", () => {
    const selected = makeTask({ _id: "t1" });
    const other    = makeTask({ _id: "t2", title: "Other" });
    const updated  = makeTask({ _id: "t2", title: "Updated Other" });
    const state = taskReducer(
      { ...initialState, tasks: [selected, other], selectedTask: selected },
      fulfilled(updateTask, updated)
    );
    expect(state.selectedTask._id).toBe("t1");
  });
});

//  deleteTask ───────────────────────────────────────────────────────────────
describe("taskSlice — deleteTask", () => {
  it("fulfilled: removes the task from the list", () => {
    const tasks = [makeTask({ _id: "t1" }), makeTask({ _id: "t2" })];
    const state = taskReducer(
      { ...initialState, tasks },
      fulfilled(deleteTask, "t1")
    );
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0]._id).toBe("t2");
  });

  it("fulfilled: clears selectedTask when it matches the deleted id", () => {
    const task = makeTask({ _id: "t1" });
    const state = taskReducer(
      { ...initialState, tasks: [task], selectedTask: task },
      fulfilled(deleteTask, "t1")
    );
    expect(state.selectedTask).toBeNull();
  });

  it("fulfilled: keeps selectedTask when a different task is deleted", () => {
    const t1 = makeTask({ _id: "t1" });
    const t2 = makeTask({ _id: "t2" });
    const state = taskReducer(
      { ...initialState, tasks: [t1, t2], selectedTask: t1 },
      fulfilled(deleteTask, "t2")
    );
    expect(state.selectedTask._id).toBe("t1");
  });
});

//  addComment ───────────────────────────────────────────────────────────────
describe("taskSlice — addComment", () => {
  it("fulfilled: updates selectedTask comments when taskId matches", () => {
    const task = makeTask({ _id: "t1", comments: [] });
    const newComments = [{ _id: "c1", text: "Looks good!" }];
    const state = taskReducer(
      { ...initialState, selectedTask: task },
      fulfilled(addComment, { taskId: "t1", comments: newComments })
    );
    expect(state.selectedTask.comments).toHaveLength(1);
    expect(state.selectedTask.comments[0].text).toBe("Looks good!");
  });

  it("fulfilled: does NOT update comments when taskId does not match", () => {
    const task = makeTask({ _id: "t1", comments: [] });
    const state = taskReducer(
      { ...initialState, selectedTask: task },
      fulfilled(addComment, { taskId: "t-other", comments: [{ _id: "c1" }] })
    );
    expect(state.selectedTask.comments).toHaveLength(0);
  });

  it("fulfilled: does nothing when selectedTask is null", () => {
    const state = taskReducer(
      { ...initialState, selectedTask: null },
      fulfilled(addComment, { taskId: "t1", comments: [{ _id: "c1" }] })
    );
    expect(state.selectedTask).toBeNull();
  });
});

//  deleteComment   
describe("taskSlice — deleteComment", () => {
  it("fulfilled: removes the matching comment from selectedTask", () => {
    const task = makeTask({
      _id: "t1",
      comments: [{ _id: "c1", text: "First" }, { _id: "c2", text: "Second" }],
    });
    const state = taskReducer(
      { ...initialState, selectedTask: task },
      fulfilled(deleteComment, { taskId: "t1", commentId: "c1" })
    );
    expect(state.selectedTask.comments).toHaveLength(1);
    expect(state.selectedTask.comments[0]._id).toBe("c2");
  });

  it("fulfilled: does nothing when taskId does not match selectedTask", () => {
    const task = makeTask({ _id: "t1", comments: [{ _id: "c1" }] });
    const state = taskReducer(
      { ...initialState, selectedTask: task },
      fulfilled(deleteComment, { taskId: "t-other", commentId: "c1" })
    );
    expect(state.selectedTask.comments).toHaveLength(1);
  });
});

//  uploadAttachment / deleteAttachment   
describe("taskSlice — uploadAttachment", () => {
  it("fulfilled: sets attachments on selectedTask when taskId matches", () => {
    const task = makeTask({ _id: "t1", attachments: [] });
    const attachments = [{ _id: "a1", url: "file.pdf" }];
    const state = taskReducer(
      { ...initialState, selectedTask: task },
      fulfilled(uploadAttachment, { taskId: "t1", attachments })
    );
    expect(state.selectedTask.attachments).toHaveLength(1);
    expect(state.selectedTask.attachments[0].url).toBe("file.pdf");
  });

  it("fulfilled: does nothing when taskId does not match", () => {
    const task = makeTask({ _id: "t1", attachments: [] });
    const state = taskReducer(
      { ...initialState, selectedTask: task },
      fulfilled(uploadAttachment, { taskId: "t-other", attachments: [{ _id: "a1" }] })
    );
    expect(state.selectedTask.attachments).toHaveLength(0);
  });
});

describe("taskSlice — deleteAttachment", () => {
  it("fulfilled: replaces attachments with the updated list", () => {
    const task = makeTask({
      _id: "t1",
      attachments: [{ _id: "a1" }, { _id: "a2" }],
    });
    const updatedAttachments = [{ _id: "a2" }];
    const state = taskReducer(
      { ...initialState, selectedTask: task },
      fulfilled(deleteAttachment, { taskId: "t1", attachments: updatedAttachments })
    );
    expect(state.selectedTask.attachments).toHaveLength(1);
    expect(state.selectedTask.attachments[0]._id).toBe("a2");
  });
});