// Allows customizing built-in MDX components, e.g. to add styling.
const components = {
  // h1: ({ children }) => <h1 style={{ fontSize: "100px" }}>{children}</h1>,
}

export function useMDXComponents() {
  return components
}
