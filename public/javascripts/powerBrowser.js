let table = new Tabulator("#powersTable", {
    //height:'600px',
    //pagination: 'local',
    virtualDom: false,
    tooltips: true,
    responsiveLayout:"collapse",
    responsiveLayoutCollapseStartOpen:false,
    responsiveLayoutCollapseFormatter:function(data){
        let list = document.createElement("ul");
        data.forEach(function(col){
            //console.log(col.title+'.'+col.value);
            if (col.value!=='&nbsp;') {
                let item = document.createElement("li");
                item.style.whiteSpace = 'normal';
                item.innerHTML = "<strong>" + col.title + "</strong>: " + col.value;
                list.appendChild(item);
            }
        });
        return Object.keys(data).length ? list : "";
    },
    layout:"fitData", //fit columns to width of table (optional)
    columns:[ //Define Table Columns
        {formatter:"responsiveCollapse", width:30, minWidth:30, hozAlign:"center", resizable:false, headerSort:false},
        {title:"Name", field:"name", headerFilter:true, headerSort:true},
        {title:"Tier", field:"minTier", width:"70", hozAlign:"center", headerFilter:true, headerSort:true },
        {title:"Tag", field:"powerTag", headerFilter:true, headerSort:false},
        {title:"Max", field:"maxTaken", width:"70", hozAlign:"center" },
        {title:"Description", field:"shortDescr", headerSort:false},
        {title:"Details", field:"fullDescr", headerSort:false},
        {title:"Prereq", field:"prerequisite", headerFilter:true, headerSort:false},
        {title:"Ability Mods", field:"abilityMods", headerFilter:true, headerSort:false},
        {title:"Associated Rules", field:"assRules", headerFilter:true, headerSort:false},
        {title:"Power Sets", field:"powerSets", headerFilter:true, headerSort:false},

    ],
    ajaxURL:"/powerList",
    /*rowClick:function(e, row){
        let cell = row.getCell('fullDescr');
        console.log(cell.getElement().style.height);
        //console.log(cell.getElement().style);
        cell.getElement().style.color = 'red';
        cell.getElement().style.whiteSpace = 'pre-wrap';
        let height = cell.getElement().style.height;
        cell.getElement().style.height = height+100;
        },
*/
});
