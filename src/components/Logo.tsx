import { Link } from 'react-router-dom'

export function Logo({ compact=false }: { compact?: boolean }) {
  return <Link className="brand" to="/" aria-label="MathPulse home">
    <span className="brand-mark" aria-hidden="true"><i/><i/><i/></span>
    {!compact && <span>Math<span>Pulse</span></span>}
  </Link>
}
