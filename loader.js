(function(selector) {
  console.log(1)
  if (document.body.className === 'not-logged-in') {
    return false
  } else {
    return document.querySelector(selector).innerHTML
  }
})