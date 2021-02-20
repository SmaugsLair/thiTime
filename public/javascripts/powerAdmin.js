
let deleteIcon = function(cell, formatterParams, onRendered) { //plain text value
    let name = cell.getRow().getData().name;
    let id = cell.getRow().getData()._id;
    let button = document.createElement('input');
    button.type = 'submit';
    button.innerHTML = 'X';
    button.formAction = '/power/delete/' + id;
    button.addEventListener('click', function (){return confirm("Delete?")});
    return button.outerHTML;
}


let table = new Tabulator("#powersTable", {
    //height:'600px',
    //pagination: 'local',
    virtualDom: false,
    tooltips: true,
    layout:"fitData", //fit columns to width of table (optional)
    columns:[ //Define Table Columns
        {formatter:deleteIcon, width:40, hozAlign:"center"},
        {title:"Name", field:"name", headerFilter:true, headerSort:true, headerSortTristate:true},
        {title:"Tag", field:"powerTag", headerFilter:true, headerSort:false}
    ],
    initialSort:[
        {column:"name", dir:"asc"}],
    ajaxURL:"/powerList",
});

//column definition in the columns array