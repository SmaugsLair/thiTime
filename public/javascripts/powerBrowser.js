let table = new Tabulator("#powersTable", {
    height:'600px', // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    pagination: 'local',
    tooltips: true,
    //data:tabledata, //assign data to table
    layout:"fitColumns", //fit columns to width of table (optional)
    columns:[ //Define Table Columns
        {title:"Name", field:"name", headerFilter:true, formatter:"textarea"},
        {title:"Ability Mods", field:"abilityMods", headerFilter:true, formatter:"textarea", headerSort:false},
        {title:"Description", field:"shortDescr", formatter:"textarea", headerSort:false},
        {title:"Tag", field:"powerTag", headerFilter:true, headerSort:false},
        {title:"Max", field:"maxTaken", width:"70", hozAlign:"center" },
        {title:"Prereq", field:"prerequisite", headerFilter:true, headerSort:false},
        {title:"Details", field:"fullDescr", headerSort:false},
    ],
    ajaxURL:"/powerList"
});