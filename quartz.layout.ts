import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
// import { createSimpleSlug } from "./quartz/util/path"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [Component.Breadcrumbs()],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/PaulisMatrix",
      Twitter: "https://x.com/1999Yadwade",
      LinkedIN: "https://www.linkedin.com/in/rushikesh-yadwade-04810a163/"
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
    Component.ContentFrontmatter(),
    Component.TableOfContents(),
  ],
  left: [
    Component.PageTitle(),
    //Component.TagList(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.Explorer(
      {
        title:"Explorer",
        folderClickBehavior: "link",
        folderDefaultState: "collapsed",
        useSavedState: false,
        mapFn: (node) => {
          if (node.displayName.toLowerCase() == "my posts"){
              node.displayName = "Blog"
          }else if(node.displayName.toLowerCase() == "my notes"){
              node.displayName = "Notes"
          }
        },
        filterFn: (node) => {
          const omit = new Set(["oss", "tags", "hosting","projects"])
          return !omit.has(node.displayName.toLowerCase())
        },
        order: ["filter", "map", "sort"],
      }
    ),
  ],
  right: [],
  /*
  right: [
    Component.RecentNotes({
      title: "Recent Writing",
      limit: 1,
      linkToMore: createSimpleSlug("/notes/")
    }),
    Component.Explorer(
      {
        title:"Explorer",
        folderClickBehavior: "collapse",
        folderDefaultState: "collapsed",
        useSavedState: true,
        filterFn: (node) => node.name !== "tags", 
        order: ["filter", "map", "sort"],
      }
    ),
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],*/
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.TagList(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    //Component.DesktopOnly(Component.Explorer()),
  ],
  right: [],
}
