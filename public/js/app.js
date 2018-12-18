$.get(resource_url, function (data) {
  // data: { meta: {<metadata>}, data: {<array[Practice]>} }
  let template = Handlebars.compile(document.getElementById('<ID>').innerHTML);
  document.getElementById('<ID>').innerHTML = template(data);
});