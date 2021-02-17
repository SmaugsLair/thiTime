for (index = 0; index < 10; ++index) {

    if (powers[index].length > 0) {

        let table = new Tabulator("#powersTable" + index, {
            height: false,
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
                    title: index + 1,
                    width: 30,
                    minWidth: 30,
                    hozAlign: "center",
                    resizable: false,
                    headerSort: false
                },
                {title: "Name", field: "name", width: '25%', headerSort: false},
                {title: "Short Description", field: "shortDescr", headerSort: false},
                {title: "Full Description", field: "fullDescr", headerSort: false}
            ]
        });
    }
    else {
        document.getElementById('tierZone'+index).style.display = 'none';
    }
}
for (index = 0; index < 10; ++index) {
    let checkButton = document.getElementById('checkButton'+index);
    if (checkButton) {
        checkButton.click();
    }
}
/*
function toggleButton(button, id) {
    console.log(button.innerHTML);
    if (x.style.display === 'none') {
        console.log('showing');
        x.style.display = 'block';
        let str = button.innerHTML.replace('Show','Hide');
        console.log('new str: '+str);
        button.innerHTML = str;
    } else {
        console.log('hiding');
        x.style.display = 'none';
        let str =button.innerHTML.replace('Hide','Show');
        console.log('new str: '+str);
        button.innerHTML = str;
    }
}*/
function check(index) {
    console.log('check:'+index);
    let checkbox = document.getElementById('toggle'+index)
    checkbox.checked = !checkbox.checked;
    let x = document.getElementById('tierZone'+index);
    let checkButton = document.getElementById('checkButton'+index)
    if (checkbox.checked) {
        x.style.display = 'block';
        checkButton.style.background = '#7f7';
    } else {
        x.style.display = 'none';
        checkButton.style.background = '#caa';
    }
}
