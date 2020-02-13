
// async function get(path, isJson = true) {
//   const response = await fetch(path);
//   return isJson ? response.json() : response.text();
// }

// document.querySelector('#resourses').addEventListener('click',async (event)=>{
//   event.preventDefault();
//     const articlesHbs = await get('/resourses.hbs', false);
//     const horses = await get('/resourses');
//     const articlesTemplate = Handlebars.compile(articlesHbs);
//     document.body.innerHTML = articlesTemplate()
  
// })

//     const articlesHbs = await get('/allCvhems.hbs', false);
//     // const horses = await get('/resourses');
//     const articlesTemplate = Handlebars.compile(articlesHbs);
//     document.body.innerHTML = articlesTemplate()
