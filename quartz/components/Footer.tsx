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
<<<<<<< HEAD
        <hr />
        <ul style={{ display: "flex" }}>
=======
        <p>
          {i18n(cfg.locale).components.footer.createdWith}{" "}
          <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a> © {year}
        </p>
        <ul>
>>>>>>> upstream/v4
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