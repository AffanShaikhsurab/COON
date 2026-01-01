export interface SidebarItem {
  title: string;
  href: string;
  items?: SidebarItem[];
}

export interface NavItem {
  text: string;
  link: string;
}

export const navItems: NavItem[] = [
  { text: "Docs", link: "/docs" },
  { text: "Guide", link: "/guide/getting-started" },
  { text: "CLI Reference", link: "/cli" },
  { text: "Ecosystem", link: "/ecosystem/implementations" },
  { text: "API Reference", link: "/reference/api" },
  { text: "Playground", link: "/playground" },
];

const guideSidebar: SidebarItem[] = [
  {
    title: "Getting Started",
    href: "/guide/getting-started",
  },
  {
    title: "Format Overview",
    href: "/guide/format-overview",
  },
  {
    title: "LLM Prompts",
    href: "/guide/llm-prompts",
  },
  {
    title: "Benchmarks",
    href: "/guide/benchmarks",
  },
  {
    title: "Compression Efficiency Benchmark",
    href: "/guide/compression-efficiency-benchmark",
  },
  {
    title: "Compression Efficiency Visual Summary",
    href: "/guide/compression-efficiency-visual-summary",
  },
  {
    title: "LLM Comprehension Benchmark",
    href: "/guide/llm-comprehension-benchmark",
  },
];

const cliSidebar: SidebarItem[] = [
  {
    title: "Overview",
    href: "/cli",
  },
];

const referenceSidebar: SidebarItem[] = [
  {
    title: "API Reference",
    href: "/reference",
  },
];

const ecosystemSidebar: SidebarItem[] = [
  {
    title: "Ecosystem",
    href: "/ecosystem",
  },
];

const docsSidebar: SidebarItem[] = [
  {
    title: "Introduction",
    href: "/docs",
  },
];

export function getSidebarForPath(path: string): SidebarItem[] {
  if (path.startsWith("/guide")) {
    return guideSidebar;
  }
  if (path.startsWith("/cli")) {
    return cliSidebar;
  }
  if (path.startsWith("/reference")) {
    return referenceSidebar;
  }
  if (path.startsWith("/ecosystem")) {
    return ecosystemSidebar;
  }
  if (path.startsWith("/docs")) {
    return docsSidebar;
  }
  return [];
}
