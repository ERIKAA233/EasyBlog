//判断时间
export const getTime = () => {
  let message = ''
  //通过内置的date获取
  let hours = new Date().getHours();
  if (hours <= 9) {
    message = '早上'
  } else if (hours <= 12) {
    message = '中午'
  } else if (hours <= 18) {
    message = '下午'
  } else {
    message = '晚上'
  }
  return message
}