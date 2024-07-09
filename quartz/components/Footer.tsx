import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  function Footer({ displayClass }: QuartzComponentProps) {
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        <hr />
        <ul style={{ display: "flex" }}>
          {Object.entries(links).map(([text, link]) => (
            //<li style={{ flex: "1 0 auto" }}>
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
          <li style={{ flexGrow: 1, textAlign: "right" }}>
            Built with <a href="https://quartz.jzhao.xyz/">Quartz</a>
          </li>
        </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor