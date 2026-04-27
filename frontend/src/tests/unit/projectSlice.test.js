import projectReducer, {
  clearSelectedProject,
  clearProjectError,
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from "../../store/slices/projectSlice.js";

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

const makeProject = (overrides = {}) => ({
  _id: "p1",
  title: "Alpha Release",
  description: "First release",
  status: "active",
  priority: "high",
  members: [],
  ...overrides,
});

const initialState = {
  projects: [],
  selectedProject: null,
  loading: false,
  detailLoading: false,
  error: null,
};

// Initial state 
describe("projectSlice — initial state", () => {
  it("returns correct initial state", () => {
    const state = projectReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual(initialState);
  });
});

//  Synchronous reducers 
describe("projectSlice — clearSelectedProject", () => {
  it("sets selectedProject to null", () => {
    const state = projectReducer(
      { ...initialState, selectedProject: makeProject() },
      clearSelectedProject()
    );
    expect(state.selectedProject).toBeNull();
  });
});

describe("projectSlice — clearProjectError", () => {
  it("sets error to null", () => {
    const state = projectReducer(
      { ...initialState, error: "Something failed" },
      clearProjectError()
    );
    expect(state.error).toBeNull();
  });
});

//  fetchProjects 
describe("projectSlice — fetchProjects", () => {
  it("pending: sets loading=true and clears error", () => {
    const state = projectReducer(
      { ...initialState, error: "old error" },
      pending(fetchProjects)
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fulfilled: stores the projects array and sets loading=false", () => {
    const projects = [makeProject({ _id: "p1" }), makeProject({ _id: "p2" })];
    const state = projectReducer(
      { ...initialState, loading: true },
      fulfilled(fetchProjects, projects)
    );
    expect(state.loading).toBe(false);
    expect(state.projects).toHaveLength(2);
    expect(state.projects[0]._id).toBe("p1");
  });

  it("rejected: stores error and sets loading=false", () => {
    const state = projectReducer(
      { ...initialState, loading: true },
      rejected(fetchProjects, "Failed to fetch projects")
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch projects");
  });
});

//  fetchProjectById 
describe("projectSlice — fetchProjectById", () => {
  it("pending: sets detailLoading=true and clears error", () => {
    const state = projectReducer(
      { ...initialState, error: "old" },
      pending(fetchProjectById)
    );
    expect(state.detailLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fulfilled: sets selectedProject and detailLoading=false", () => {
    const project = makeProject({ _id: "p1" });
    const state = projectReducer(
      { ...initialState, detailLoading: true },
      fulfilled(fetchProjectById, project)
    );
    expect(state.detailLoading).toBe(false);
    expect(state.selectedProject).toEqual(project);
  });

  it("rejected: stores error and sets detailLoading=false", () => {
    const state = projectReducer(
      { ...initialState, detailLoading: true },
      rejected(fetchProjectById, "Failed to fetch project")
    );
    expect(state.detailLoading).toBe(false);
    expect(state.error).toBe("Failed to fetch project");
  });
});

//  createProject 
describe("projectSlice — createProject", () => {
  it("fulfilled: prepends new project to the front of the list", () => {
    const existing = makeProject({ _id: "p0", title: "Old Project" });
    const created  = makeProject({ _id: "p1", title: "New Project" });
    const state = projectReducer(
      { ...initialState, projects: [existing] },
      fulfilled(createProject, created)
    );
    expect(state.projects[0]).toEqual(created);
    expect(state.projects[1]).toEqual(existing);
    expect(state.projects).toHaveLength(2);
  });

  it("fulfilled: works when the list is empty", () => {
    const created = makeProject({ _id: "p1" });
    const state = projectReducer(
      initialState,
      fulfilled(createProject, created)
    );
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0]._id).toBe("p1");
  });
});

//  updateProject 
describe("projectSlice — updateProject", () => {
  it("fulfilled: replaces the project with the updated version in the list", () => {
    const original = makeProject({ _id: "p1", title: "Old Title" });
    const updated  = makeProject({ _id: "p1", title: "New Title" });
    const state = projectReducer(
      { ...initialState, projects: [original] },
      fulfilled(updateProject, updated)
    );
    expect(state.projects[0].title).toBe("New Title");
  });

  it("fulfilled: also updates selectedProject if it matches the updated id", () => {
    const project = makeProject({ _id: "p1", title: "Old" });
    const updated  = makeProject({ _id: "p1", title: "Updated" });
    const state = projectReducer(
      { ...initialState, projects: [project], selectedProject: project },
      fulfilled(updateProject, updated)
    );
    expect(state.selectedProject.title).toBe("Updated");
  });

  it("fulfilled: does NOT touch selectedProject when id does not match", () => {
    const project  = makeProject({ _id: "p1" });
    const other    = makeProject({ _id: "p2", title: "Other" });
    const updated  = makeProject({ _id: "p2", title: "Updated Other" });
    const state = projectReducer(
      { ...initialState, projects: [project, other], selectedProject: project },
      fulfilled(updateProject, updated)
    );
    expect(state.selectedProject._id).toBe("p1");
  });

  it("fulfilled: does nothing when project id is not found in list", () => {
    const project = makeProject({ _id: "p1" });
    const state = projectReducer(
      { ...initialState, projects: [project] },
      fulfilled(updateProject, makeProject({ _id: "ghost" }))
    );
    expect(state.projects[0]._id).toBe("p1");
  });
});

//  deleteProject 
describe("projectSlice — deleteProject", () => {
  it("fulfilled: removes the project from the list", () => {
    const projects = [makeProject({ _id: "p1" }), makeProject({ _id: "p2" })];
    const state = projectReducer(
      { ...initialState, projects },
      fulfilled(deleteProject, "p1")
    );
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0]._id).toBe("p2");
  });

  it("fulfilled: clears selectedProject when it matches the deleted id", () => {
    const project = makeProject({ _id: "p1" });
    const state = projectReducer(
      { ...initialState, projects: [project], selectedProject: project },
      fulfilled(deleteProject, "p1")
    );
    expect(state.selectedProject).toBeNull();
  });

  it("fulfilled: keeps selectedProject when a different project is deleted", () => {
    const p1 = makeProject({ _id: "p1" });
    const p2 = makeProject({ _id: "p2" });
    const state = projectReducer(
      { ...initialState, projects: [p1, p2], selectedProject: p1 },
      fulfilled(deleteProject, "p2")
    );
    expect(state.selectedProject._id).toBe("p1");
  });
});

//  addProjectMember / removeProjectMember 
describe("projectSlice — addProjectMember", () => {
  it("fulfilled: updates selectedProject when ids match", () => {
    const original = makeProject({ _id: "p1", members: [] });
    const updated  = makeProject({ _id: "p1", members: [{ _id: "u1", name: "Alice" }] });
    const state = projectReducer(
      { ...initialState, selectedProject: original },
      fulfilled(addProjectMember, updated)
    );
    expect(state.selectedProject.members).toHaveLength(1);
    expect(state.selectedProject.members[0].name).toBe("Alice");
  });

  it("fulfilled: does NOT update selectedProject when ids do not match", () => {
    const selected = makeProject({ _id: "p1" });
    const other    = makeProject({ _id: "p2", members: [{ _id: "u1" }] });
    const state = projectReducer(
      { ...initialState, selectedProject: selected },
      fulfilled(addProjectMember, other)
    );
    expect(state.selectedProject.members).toHaveLength(0);
  });
});

describe("projectSlice — removeProjectMember", () => {
  it("fulfilled: updates selectedProject with member removed", () => {
    const original = makeProject({ _id: "p1", members: [{ _id: "u1" }, { _id: "u2" }] });
    const updated  = makeProject({ _id: "p1", members: [{ _id: "u2" }] });
    const state = projectReducer(
      { ...initialState, selectedProject: original },
      fulfilled(removeProjectMember, updated)
    );
    expect(state.selectedProject.members).toHaveLength(1);
    expect(state.selectedProject.members[0]._id).toBe("u2");
  });
});