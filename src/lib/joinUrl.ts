export interface LocationParts { origin: string; pathname: string }

export function appBaseUrl(location:LocationParts = window.location):string {
  let path=location.pathname||'/'
  if(path.endsWith('/index.html'))path=path.slice(0,-'index.html'.length)
  if(!path.endsWith('/'))path=`${path}/`
  return `${location.origin}${path}`
}

export function playUrl(location:LocationParts = window.location):string {
  return `${appBaseUrl(location)}#/play`
}

export function liveJoinUrl(pin:string,location:LocationParts = window.location):string {
  return `${playUrl(location)}/${encodeURIComponent(pin.trim())}`
}
