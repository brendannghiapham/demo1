// utils.js
export function getAllUserProjects(apiResponse) {
  const projectMap = new Map();

  apiResponse.users
    .flatMap((user) => user.projects)
    .forEach((project) => {
      if (!projectMap.has(project.key)) {
        projectMap.set(project.key, { key: project.key, name: project.name });
      }
    });

  return Array.from(projectMap.values());
}
