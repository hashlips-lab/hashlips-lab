import Image from "next/image";
import Link from "next/link";

export default {
  project: {
    link: 'https://github.com/hashlips-lab/hashlips-lab',
  },
  docsRepositoryBase: 'https://github.com/hashlips-lab/hashlips-lab/blob/main/apps/website',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – HashLips Lab'
    }
  },
  primaryHue: 300,
  logo: (
    <>
      <Image src="/hashlips-mask.png" width="24" height="24" alt="HashLips Lab logo" />
      <span style={{ marginLeft: '.4em', fontWeight: 800 }}>
        HashLips Lab
      </span>
    </>
  ),
  footer: {
    text: <span>
      MIT {new Date().getFullYear()} © <Link href="/about">HashLips Lab Team</Link>.
    </span>,
  }
}