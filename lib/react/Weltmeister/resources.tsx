export const makeResource = (url: string | number, filePath: string) => {
  // this is called when running Weltmeister, through babel plugin
  return { url, filePath }
}

export const resolveResource = (resource: any) => {
  if (typeof resource !== 'object') {
    return resource
  }
  // from j
  return resource.url
}
