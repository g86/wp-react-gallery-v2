import React from 'react'

export const replaceAllRegex = (str, find, replace) => {
  return str.replace(new RegExp(find, 'g'), replace);
}
export const getSizePath = (path, size) => {
  return path.replace('galleries', `public-images/${size}`) // .replace('www','react-demo')
}