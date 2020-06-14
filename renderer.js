// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// window.$ = window.jQuery = require("./src/js/jquery.min.js");
var path = require('path');
const remote = require('electron').remote;
const app = remote.app;
const fs = require('fs');
var appPath = app.getAppPath();
const {
    dialog
} = require('electron').remote;
const docsPath = app.getPath('documents')


/*******************************************************************/
/************                 INITIAL LOAD              ************/
/*******************************************************************/

let table = $('#medicine-table').DataTable({
    lengthMenu: [10, 20, 50, 100, 500],
    pageLength: 20,
    dom: 'lBfrtip',
    buttons: [
        {
            extend: 'csv',
            text: 'Download as CSV',
        }
    ],
    drawCallback: function () {
        var api = this.api();
        formatSideEffects(api.page.info().page)
    }
})

function readData() {
    var dirPath = path.join(docsPath, '/medicines');
    var med = path.join(docsPath, '/medicines/medicines.json');
    var casesFile = path.join(docsPath, '/medicines/cases.json');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
        fs.writeFileSync(med, {}, {
            encoding: "utf8",
            flag: "w+",
        })
        fs.writeFileSync(casesFile, {}, {
            encoding: "utf8",
            flag: "w+",
        })
    }

    //Medicines file does not exists
    if (!fs.existsSync(med)) {
        fs.writeFileSync(med, '{}', {
            encoding: "utf8",
            flag: "w+",
        })
    }

    //Cases file does not exists
    if (!fs.existsSync(casesFile)) {
        fs.writeFileSync(casesFile, '{}', {
            encoding: "utf8",
            flag: "w+",
        })
    }

    let cases = JSON.parse(fs.readFileSync(casesFile, 'utf-8'))
    let tableRow = [], i = 0
    $('#cases-table').DataTable().clear();
    for (let _case in cases) {
        tableRow = []
        tableRow.push(++i)
        tableRow.push(cases[_case]['case'])
        tableRow.push(`<div class='dropdown'>
            <button class='btn btn-secondary btn-sm dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
            Action
            </button>
            <div class='dropdown-menu dropdown-menu-right' aria-labelledby='dropdownMenuButton'>
            <a class='dropdown-item openCaseButton' id='${_case + "-openButton"}' href='#'>Open</a>
            <a class='dropdown-item editCaseButton' id='${_case + "-editButton"}' href='#'>Edit</a>
            <a class='dropdown-item deleteCaseButton' id='${_case + "-deleteButton"}' href='#'>Delete</a>
            </div>
        </div>`)
        $('#cases-table').DataTable().row.add(tableRow);
    }
    $('#cases-table').DataTable().draw(false);


    let medicines = JSON.parse(fs.readFileSync(med, 'utf-8'))

    tableRow = [], i = 0
    $('#medicine-table').DataTable().clear();
    for (let medicine in medicines) {
        tableRow = []
        tableRow.push(++i)
        for (let key in medicines[medicine]) {
            if (key === 'per' || key === 'of' || key === "instructionsExtra") {
                continue
            }

            if (key === 'price' && medicines[medicine][key]) {
                tableRow.push('Rs. ' + medicines[medicine][key] + ' per ' + medicines[medicine]['per'] + '<br> <p class="text-danger">' + medicines[medicine]['per'] + ' of ' + medicines[medicine]['of'] + ' ' + medicines[medicine]['type'] + '(s)</p>')
            } else if (key === "instructions") {
                tableRow.push((medicines[medicine][key] || "") + " " + (medicines[medicine]['instructionsExtra'] || ""))
            } else {
                tableRow.push(medicines[medicine][key])
            }
        }
        tableRow.push(`<div class='dropdown'>
        <button class='btn btn-secondary btn-sm dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
          Action
        </button>
        <div class='dropdown-menu dropdown-menu-right' aria-labelledby='dropdownMenuButton'>
          <a class='dropdown-item editButton' id='${medicine + "-editButton"}' href='#'>Edit</a>
          <a class='dropdown-item deleteButton' id='${medicine + "-deleteButton"}' href='#'>Delete</a>
        </div>
      </div>`)
        $('#medicine-table').DataTable().row.add(tableRow);
    }

    $('#medicine-table').DataTable().draw(false);

    readManageDropdownData()
}

$(document).ready(readData)

$('#medicine-table').on('page.dt', function () {
    formatSideEffects(table.page.info().page)
});


function formatSideEffects(page = 0) {
    var table = document.getElementById('medicine-table');
    let i = 0;
    for (let row of table.rows) {
        if (i++ === 0 || row.childNodes[0].classList[0] === 'dataTables_empty') continue;
        let id = row.childNodes[0].innerHTML
        let sideEffect = row.childNodes[10].innerHTML

        let use = row.childNodes[9].innerHTML
        let comp = row.childNodes[3].innerHTML
        let instruction = row.childNodes[7].innerHTML
        let cls = row.childNodes[8].innerHTML

        if (sideEffect.startsWith('<div onmouseover=') || use.startsWith('<div onmouseover=') || comp.startsWith('<div onmouseover=') || instruction.startsWith('<div onmouseover=') || cls.startsWith('<div onmouseover=')) {
            continue
        }

        let modifiedSideEffect = sideEffect
        let modifiedUse = use
        let modifiedComp = comp
        let modifiedInstruction = instruction
        let modifiedClass = cls

        if (modifiedSideEffect.length > 10) {
            modifiedSideEffect = modifiedSideEffect.substr(0, 11)
            modifiedSideEffect = modifiedSideEffect + '...'
            modifiedSideEffect = '<div onmouseover="showSETooltip(' + id + ')" onmouseleave="hideSETooltip(' + id + ')" class="sideEffectTd" id="sideEffectTd' + id + '">' + modifiedSideEffect + ' <p lang="en" class="sideEffectTooltip" id="sideEffectTooltip' + id + '">' + sideEffect + '</p></div>'
        }

        if (modifiedUse.length > 10) {
            modifiedUse = modifiedUse.substr(0, 11)
            modifiedUse = modifiedUse + '...'
            modifiedUse = '<div onmouseover="showUseTooltip(' + id + ')" onmouseleave="hideUseTooltip(' + id + ')" class="sideEffectTd" id="useEffectTd' + id + '">' + modifiedUse + ' <p lang="en" class="sideEffectTooltip" id="useTooltip' + id + '">' + use + '</p></div>'
        }

        if (modifiedComp.length > 15) {
            modifiedComp = modifiedComp.substr(0, 11)
            modifiedComp = modifiedComp + '...'
            modifiedComp = '<div onmouseover="showCompTooltip(' + id + ')" onmouseleave="hideCompTooltip(' + id + ')" class="sideEffectTd" id="compTd' + id + '">' + modifiedComp + ' <p lang="en" class="sideEffectTooltip" id="compTooltip' + id + '">' + comp + '</p></div>'
        }

        if (modifiedInstruction.length > 15) {
            modifiedInstruction = modifiedInstruction.substr(0, 11)
            modifiedInstruction = modifiedInstruction + '...'
            modifiedInstruction = '<div onmouseover="showInstTooltip(' + id + ')" onmouseleave="hideInstTooltip(' + id + ')" class="sideEffectTd" id="instTd' + id + '">' + modifiedInstruction + ' <p lang="en" class="sideEffectTooltip" id="instTooltip' + id + '">' + instruction + '</p></div>'
        }

        if (modifiedClass.length > 15) {
            modifiedClass = modifiedClass.substr(0, 11)
            modifiedClass = modifiedClass + '...'
            modifiedClass = '<div onmouseover="showClassTooltip(' + id + ')" onmouseleave="hideClassTooltip(' + id + ')" class="sideEffectTd" id="classTd' + id + '">' + modifiedClass + ' <p lang="en" class="sideEffectTooltip" id="classTooltip' + id + '">' + cls + '</p></div>'
        }
        row.childNodes[10].innerHTML = modifiedSideEffect
        row.childNodes[9].innerHTML = modifiedUse
        row.childNodes[3].innerHTML = modifiedComp
        row.childNodes[7].innerHTML = modifiedInstruction
        row.childNodes[8].innerHTML = modifiedClass
    }
}

$('.container').on('click', '.editButton', function (e) {
    let medId = e.target.id.split('-')[0]
    var p = path.join(docsPath, '/medicines/medicines.json');
    let medicines = JSON.parse(fs.readFileSync(p, 'utf-8'))
    let medToBeEdited = medicines[medId]
    $('#typeSelectEdit').val(medToBeEdited.type);
    $('#nameInputEdit').val(medToBeEdited.name);
    $('#priceInputEdit').val(medToBeEdited.price);
    $('#manufacturerInputEdit').val(medToBeEdited.manufacturer);
    $('#unitInputEdit').val(medToBeEdited.per);
    $('#ofInputEdit').val(medToBeEdited.of);
    $('#compInputEdit').val(medToBeEdited.composition);
    $('#doseInputEdit').val(medToBeEdited.dose);
    $('#routeInputEdit').val(medToBeEdited.route);
    $('#frequencyInputEdit').val(medToBeEdited.frequency);
    $('#instructionInputEdit').val(medToBeEdited.instructions);
    $('#instructionExtraInputEdit').val(medToBeEdited.instructionsExtra);
    $('#classInputEdit').val(medToBeEdited.class);
    $('#useInputEdit').val(medToBeEdited.use);
    $('#sideEffectEdit').val(medToBeEdited.sideEffects);
    $('#shopsInputEdit').val(medToBeEdited.shops);
    $('#medIdInput').val(medId);
    $('#editModal').modal('show')
});

$('.container').on('click', '.deleteButton', function (e) {
    let medId = e.target.id.split('-')[0]
    var p = path.join(docsPath, '/medicines/medicines.json');
    let medicines = JSON.parse(fs.readFileSync(p, 'utf-8'))
    let medToBeDeleted = medicines[medId]

    const options = {
        type: 'question',
        buttons: ["Delete", "Cancel"],
        title: 'Success',
        message: 'Sure to delete ' + medToBeDeleted.name + '?',
        detail: "Once deleted, this action cannot be undone."
    };
    dialog.showMessageBox(null, options)
        .then((s) => {
            if (s.response === 0) {
                delete medicines[medId]
                $('#toastText').html('<strong>' + medToBeDeleted.name + '</strong>' + ' was successfully deleted.')
                fs.writeFileSync(p, JSON.stringify(medicines))
                readData()
                $('#deleteToast').toast('show')
            }
        })
})

$('#update-med-btn').click(function () {
    var type = $('#typeSelectEdit').val();
    var name = $('#nameInputEdit').val();
    var manufacturer = $('#manufacturerInputEdit').val();
    var price = $('#priceInputEdit').val();
    var unit = $('#unitInputEdit').val();
    var ofInp = $('#ofInputEdit').val()
    var composition = $('#compInputEdit').val();
    var dose = $('#doseInputEdit').val();
    var route = $('#routeInputEdit').val();
    var frequency = $('#frequencyInputEdit').val();
    var instructions = $('#instructionInputEdit').val();
    var instructionsExtra = $('#instructionExtraInputEdit').val();
    var class_ = $('#classInputEdit').val();
    var use = $('#useInputEdit').val();
    var sideEffects = $('#sideEffectEdit').val();
    var shops = $('#shopsInputEdit').val();
    var medId = $('#medIdInput').val();
    //save goes here
    var p = path.join(docsPath, '/medicines/medicines.json');
    let medicines = JSON.parse(fs.readFileSync(p, 'utf-8'))
    medicines[medId] = {
        "type": type,
        "name": name,
        "manufacturer": manufacturer,
        "composition": composition,
        "dose": dose,
        "route": route,
        "frequency": frequency,
        "instructions": instructions,
        "instructionsExtra": instructionsExtra,
        "class": class_,
        "use": use,
        "sideEffects": sideEffects,
        "shops": shops,
        "price": price,
        "per": unit,
        "of": ofInp,
    }

    fs.writeFileSync(p, JSON.stringify(medicines))
    readData()
    const options = {
        type: 'info',
        title: 'Success',
        message: 'Success!',
        detail: "Medicine was successfully updated."
    };
    dialog.showMessageBox(null, options);
    $('#editModal :input').val('');
    $('#typeSelectEdit').val('Choose Types');
    $('#unitInputEdit').val('Choose unit');
})

$('#save-med-btn').click(function () {
    var type = $('#typeSelect').val();
    var name = $('#nameInput').val();
    var manufacturer = $('#manufacturerInput').val();
    var price = $('#priceInput').val();
    var composition = $('#compInput').val();
    var dose = $('#doseInput').val();
    var route = $('#routeInput').val();
    var frequency = $('#frequencyInput').val();
    var instructions = $('#instructionInput').val();
    var instructionsExtra = $('#instructionExtraInput').val();
    var class_ = $('#classInput').val();
    var use = $('#useInput').val();
    var sideEffects = $('#sideEffect').val();
    var shops = $('#shopsInput').val();
    var unit = $('#unitInput').val();
    var ofInp = $('#ofInput').val();

    //save goes here
    var p = path.join(docsPath, '/medicines/medicines.json');
    let medicines = JSON.parse(fs.readFileSync(p, 'utf-8'))
    medicines[Date.now()] = {
        "type": type,
        "name": name,
        "manufacturer": manufacturer,
        "composition": composition,
        "dose": dose,
        "route": route,
        "frequency": frequency,
        "instructions": instructions,
        "instructionsExtra": instructionsExtra,
        "class": class_,
        "use": use,
        "sideEffects": sideEffects,
        "shops": shops,
        "price": price,
        "per": unit,
        "of": ofInp
    }
    // medicines.push()

    fs.writeFileSync(p, JSON.stringify(medicines))
    readData()
    const options = {
        type: 'info',
        title: 'Success',
        message: 'Success!',
        detail: "Medicine was successfully saved."
    };
    dialog.showMessageBox(null, options);
    $('#exampleModal :input').val('');
    $('#typeSelect').val('Choose Types');
    $('#unitInput').val('Choose unit');
})

/*******************************************************************/
/**********                 CASES ELEMENTS              ***********/
/*******************************************************************/

$('#cases_container').on('click', '.deleteCaseButton', function (e) {
    let caseId = e.target.id.split('-')[0]
    var p = path.join(docsPath, '/medicines/cases.json');
    let cases = JSON.parse(fs.readFileSync(p, 'utf-8'))
    let caseToBeDeleted = cases[caseId]

    const options = {
        type: 'question',
        buttons: ["Delete", "Cancel"],
        title: 'Success',
        message: 'Sure to delete ' + caseToBeDeleted.case + '?',
        detail: "Once deleted, this action cannot be undone."
    };
    dialog.showMessageBox(null, options)
    .then((s) => {
        if (s.response === 0) {
            console.log("here")
            console.log(cases)
            delete cases[caseId]
            console.log(cases)
            $('#toastText').html('<strong>' + caseToBeDeleted.case + '</strong>' + ' was successfully deleted.')
            fs.writeFileSync(p, JSON.stringify(cases))
            readData()
            $('#deleteToast').toast('show')
        }
    })
})


$('#cases_container').on('click', '.editCaseButton', function (e) {
    let caseId = e.target.id.split('-')[0]
    var p = path.join(docsPath, '/medicines/cases.json');
    let cases = JSON.parse(fs.readFileSync(p, 'utf-8'))
    let caseToBeEdited = cases[caseId]

    $('#caseNameInput').val(caseToBeEdited.case);
    $('#dateInput').val(caseToBeEdited.date);
    $('#ageInput').val(caseToBeEdited.age);
    $('#genderInput').val(caseToBeEdited.gender);
    $('#bpInput').val(caseToBeEdited.bp);
    $('#pulseInput').val(caseToBeEdited.pulse);
    $('#temperatureInput').val(caseToBeEdited.temperature);
    $('#spo2Input').val(caseToBeEdited.spo2);
    $('#chiefComplainInput').val(caseToBeEdited.chiefComplain);
    $('#historyInput').val(caseToBeEdited.history);
    $('#medicationInput').val(caseToBeEdited.medication);
    $('#testCaseInput').val(caseToBeEdited.test);
    $('#adviceInput').val(caseToBeEdited.advice);
    $('#reviewInput').val(caseToBeEdited.review);
    $('#noteInput').val(caseToBeEdited.note);
    $('#caseIdInput').val(caseId);
    $('#save-case-btn').hide();
    $('#update-case-btn').show();
    $('#casesAddModal').modal('show')
})


$('#save-case-btn').click(function () {
    var _case = $('#caseNameInput').val();
    var date = $('#dateInput').val();
    var age = $('#ageInput').val();
    var gender = $('#genderInput').val();
    var bloodPressure = $('#bpInput').val();
    var pulse = $('#pulseInput').val();
    var temperature = $('#temperatureInput').val();
    var spo2 = $('#spo2Input').val();
    var chiefComplain = $('#chiefComplainInput').val();
    var history = $('#historyInput').val();
    var medication = $('#medicationInput').val();
    var test = $('#testCaseInput').val();
    var advice = $('#adviceInput').val();
    var review = $('#reviewInput').val();
    var note = $('#noteInput').val();

    console.log(chiefComplain)

    // save goes here
    var p = path.join(docsPath, '/medicines/cases.json');
    let cases = JSON.parse(fs.readFileSync(p, 'utf-8'))
    cases[Date.now()] = {
        "case": _case,
        "date": date,
        "age": age,
        "gender": gender,
        "bloodPressure": bloodPressure,
        "pulse": pulse,
        "temperature": temperature,
        "spo2": spo2,
        "chiefComplain": chiefComplain,
        "history": history,
        "medication": medication,
        "test": test,
        "advice": advice,
        "review": review,
        "note": note
    }

    fs.writeFileSync(p, JSON.stringify(cases))
    readData()
    const options = {
        type: 'info',
        title: 'Success',
        message: 'Success!',
        detail: "Case was successfully saved."
    };
    dialog.showMessageBox(null, options);
    $('#casesAddModal :input').val('');
})


/*******************************************************************/
/*********                 DROPDOWN ELEMENTS              **********/
/*******************************************************************/

$('#addTypeBtn').click(function () {
    addDropDownItem({
        name: "Type",
        inputId: "addtype",
        fileName: "types.json",
        fileKey: "types"
    })
})

$('#addRouteBtn').click(function () {
    addDropDownItem({
        name: "Route",
        inputId: "addRoute",
        fileName: "routes.json",
        fileKey: "routes"
    })
})

$('#addInstructionBtn').click(function () {
    addDropDownItem({
        name: "Instruction",
        inputId: "addInstruction",
        fileName: "instructions.json",
        fileKey: "instructions"
    })
})

$('#addPerBtn').click(function () {
    addDropDownItem({
        name: "Per",
        inputId: "addPer",
        fileName: "per.json",
        fileKey: "per"
    })
})

$('#addChiefComplainBtn').click(function () {
    addDropDownItem({
        name: "ChiefComplain",
        inputId: "addChiefComplain",
        fileName: "chiefComplain.json",
        fileKey: "chiefComplain"
    })
    $( "#chiefComplainInput").trigger( "updateData", [ "Custom", "Event" ] );
    // $('#chiefComplainInput').multiSelect();
})

$('#deleteTypeBtn').click(function () {
    deleteDropDownItem({
        name: "Type",
        inputId: "delTypeSelect",
        fileName: "types.json",
        fileKey: "types"
    })
})

$('#deleteRouteBtn').click(function () {
    deleteDropDownItem({
        name: "Route",
        inputId: "delRouteSelect",
        fileName: "routes.json",
        fileKey: "routes"
    })
})

$('#deleteInstructionBtn').click(function () {
    deleteDropDownItem({
        name: "Instruction",
        inputId: "delInstructionSelect",
        fileName: "instructions.json",
        fileKey: "instructions"
    })
})

$('#deletePerBtn').click(function () {
    deleteDropDownItem({
        name: "Per",
        inputId: "delPerSelect",
        fileName: "per.json",
        fileKey: "per"
    })
})

$('#deleteChiefComplainBtn').click(function () {
    deleteDropDownItem({
        name: "Chief Complain",
        inputId: "delChiefComplainSelect",
        fileName: "chiefComplain.json",
        fileKey: "chiefComplain"
    })
    

})

function readManageDropdownData() {
    //TYPES MANAGE
    let types = readDataFromFile({ fileName: 'types.json', defaultData: '{"types":[]}' })
    updateTypeDropdown(types, 'delTypeSelect', 'types')
    updateTypeDropdown(types, 'typeSelect', 'types')
    updateTypeDropdown(types, 'typeSelectEdit', 'types')

    //ROUTES MANAGE
    let routes = readDataFromFile({ fileName: 'routes.json', defaultData: '{"routes":[]}' })
    updateTypeDropdown(routes, 'delRouteSelect', "routes")
    updateTypeDropdown(routes, 'routeInput', 'routes')
    updateTypeDropdown(routes, 'routeInputEdit', 'routes')

    //INSTRUCTIONS MANAGE
    let instructions = readDataFromFile({ fileName: 'instructions.json', defaultData: '{"instructions":[]}' })
    updateTypeDropdown(instructions, 'delInstructionSelect', 'instructions')
    updateTypeDropdown(instructions, 'instructionInput', 'instructions')
    updateTypeDropdown(instructions, 'instructionInputEdit', 'instructions')

    //PER MANAGE
    let per = readDataFromFile({ fileName: 'per.json', defaultData: '{"per":[]}' })
    updateTypeDropdown(per, 'delPerSelect', 'per')
    updateTypeDropdown(per, 'unitInput', 'per')
    updateTypeDropdown(per, 'unitInputEdit', 'per')

    //PER MANAGE
    let chiefComplain = readDataFromFile({ fileName: 'chiefComplain.json', defaultData: '{"chiefComplain":[]}' })
    updateTypeDropdown(chiefComplain, 'delChiefComplainSelect', 'chiefComplain')
    updateTypeDropdown(chiefComplain, 'chiefComplainInput', 'chiefComplain')
    // updateTypeDropdown(per, 'unitInputEdit', 'per')
}

function readDataFromFile(options) {
    var p = path.join(docsPath, '/medicines/' + options.fileName);
    if (!fs.existsSync(p)) { //file does not exists
        fs.writeFileSync(p, options.defaultData, {
            encoding: "utf8",
            flag: "w+",
        })
    }
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

function updateTypeDropdown(data, id, key) {
    var select = document.getElementById(id);
    select.options.length = 1;
    for (let [i, type] of data[key].entries()) {
        select.options[select.options.length] = new Option(type, i);
    }
    $(function () {
        console.log("we are here")
        $('#chiefComplainInput').multiSelect();
    });
}

function addDropDownItem(options) {
    name = options.name
    inputId = options.inputId
    fileName = options.fileName
    fileKey = options.fileKey

    let newVal = $('#' + inputId).val()
    if (!newVal) {
        dialog.showErrorBox("Error", "Please fill in the name of the new 'Route'.")
        return
    }

    //Read types
    var p = path.join(docsPath, '/medicines/' + fileName);
    let data = JSON.parse(fs.readFileSync(p, 'utf-8'))

    //Type already exsists
    if (data[fileKey].indexOf(newVal) > -1) {
        dialog.showErrorBox("Conflict", "The " + name + " `" + newVal + "` already exists.")
        return
    }

    //Add the new type
    data[fileKey].push(newVal)
    fs.writeFileSync(p, JSON.stringify(data))

    //Show success message
    updateTypeDropdown(data, 'del' + name + 'Select', fileKey)
    $('#' + inputId).val('')
    const msgOptions = {
        type: 'info',
        title: 'Success',
        message: 'Success!',
        detail: "The " + name + " '" + newVal + "' was successfully saved."
    };
    dialog.showMessageBox(null, msgOptions);
}

function deleteDropDownItem(options) {
    name = options.name
    inputId = options.inputId
    fileName = options.fileName
    fileKey = options.fileKey

    let delId = $('#' + inputId).val()
    let delName = $('#' + inputId + ' option:selected').text()

    if (!delId || delId === 'default') {
        dialog.showErrorBox("Error", "Please select the '" + name + "' that is to be deleted.")
        return
    }

    var p = path.join(docsPath, '/medicines/' + fileName);
    let data = JSON.parse(fs.readFileSync(p, 'utf-8'))

    //Remove and write to file
    data[fileKey].splice(delId, 1)
    fs.writeFileSync(p, JSON.stringify(data))

    updateTypeDropdown(data, inputId, fileKey)

    //Show success message
    $('#' + inputId).val('default')
    const msgOptions = {
        type: 'info',
        title: 'Success',
        message: 'Success!',
        detail: "The " + name + " '" + delName + "' was successfully deleted."
    };
    dialog.showMessageBox(null, msgOptions);
}