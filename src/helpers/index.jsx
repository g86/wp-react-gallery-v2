export const fileSizeFromBytes = (sizeInBytes, toUnits = 'mb') => {
  let size = 0
  switch (toUnits) {
    case "kb":
      size = (sizeInBytes / 1024).toFixed(2)
      break
    default:
      size = (sizeInBytes / (1024 * 1024)).toFixed(2)
      break
  }
  return size
}