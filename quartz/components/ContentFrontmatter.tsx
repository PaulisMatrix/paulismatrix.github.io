import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1)
const isURL = (s: string): boolean => {
  try {
    new URL(s)
    return true
  } catch (_) {
    return false
  }
}

export default (() => {
  function ContentFrontmatter({ fileData }: QuartzComponentProps) {
    if (fileData.slug == "index" || !fileData.frontmatter) {
      return null
    }
    const frontmatter: { [key: string]: string } = fileData.frontmatter
    const fieldsToShow = ["source", "origin"].filter((field) => frontmatter[field])

    if (fieldsToShow.length) {
      return (
        <div class="content-frontmatter">
          {fieldsToShow.map((field) => (
            <div style="list-style: none; margin-left: 0; padding-left: 0;">
              {capitalize(field)} :{" "}
              {isURL(frontmatter[field]) ? (
                <a href={frontmatter[field]} class="external" style="color: inherit;">
                  {frontmatter[field]}
                </a>
              ) : (
                <span>{frontmatter[field]}</span>
              )}
            </div>
          ))}
        </div>
      )
    } else {
      return null
    }
  }

  ContentFrontmatter.css = `
  .content-frontmatter {
    margin-top: 0;
    margin-bottom: 1em;
    color: var(--gray);
    
  }
  `
  return ContentFrontmatter
}) satisfies QuartzComponentConstructor