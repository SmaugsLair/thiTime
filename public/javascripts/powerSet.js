for (index = 0; index < 10; ++index) {

    let table = new Tabulator("#powersTable" + index, {
        height:false,
        virtualDom: false,
        //pagination: 'local',
        data: powers[index],
        tooltips: true,
        responsiveLayout: "collapse",
        responsiveLayoutCollapseStartOpen: false,
        responsiveLayoutCollapseFormatter: function (data) {
            let list = document.createElement("ul");
            data.forEach(function (col) {
                //console.log(col.title+'.'+col.value);
                if (col.value !== '&nbsp;') {
                    let item = document.createElement("li");
                    item.style.whiteSpace = 'normal';
                    item.innerHTML = "<strong>" + col.title + "</strong>: " + col.value;
                    list.appendChild(item);
                }
            });
            return Object.keys(data).length ? list : "";
        },
        layout: "fitDataFill", //fit columns to width of table (optional)
        columns: [ //Define Table Columns
            {
                formatter: "responsiveCollapse",
                title: index+1,
                width: 30,
                minWidth: 30,
                hozAlign: "center",
                resizable: false,
                headerSort: false
            },
            {title: "Name", field: "name", width: '25%', headerSort: false},
            {title: "Description", field: "shortDescr", headerSort: false},
            {title: "Details", field: "fullDescr", headerSort: false}
        ]
    });
}
