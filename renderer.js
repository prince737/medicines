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
const prompt = require('electron-prompt');


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

function readData(initial=false) {
    var dirPath = path.join(docsPath, '/medicines');
    var med = path.join(docsPath, '/medicines/medicines.json');
    var casesFile = path.join(docsPath, '/medicines/cases.json');
    var patientsFile = path.join(docsPath, '/medicines/patients.json');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
        fs.writeFileSync(med, '{}', {
            encoding: "utf8",
            flag: "w+",
        })
        fs.writeFileSync(casesFile, '{}', {
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

    //PAtients file does not exists
    if (!fs.existsSync(patientsFile)) {
        fs.writeFileSync(patientsFile, '{}', {
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


    let patients = JSON.parse(fs.readFileSync(patientsFile, 'utf-8'))
    tableRow = [], i = 0
    $('#patients-table').DataTable().clear();
    for (let patient in patients) {
        tableRow = []
        tableRow.push(++i)
        for (let key in patients[patient]){
            if(key == "time" && patients[patient][key]){
                let timeArr = patients[patient][key].split(':')
                let initTime = parseInt(timeArr[0])
                if(initTime > 12){
                    initTime -= 12
                    initTime = `${initTime}`.padStart(2,0)
                    patients[patient][key] = `${initTime}:${timeArr[1]} PM`
                }else{
                    initTime = `${initTime}`.padStart(2,0)
                    patients[patient][key] = `${initTime}:${timeArr[1]} AM`
                }
            }
            tableRow.push(patients[patient][key])
        }
        tableRow.push(`<div class='dropdown'>
            <button class='btn btn-secondary btn-sm dropdown-toggle' type='button' id='dropdownMenuButtonPatient' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
            Action
            </button>
            <div class='dropdown-menu dropdown-menu-right' aria-labelledby='dropdownMenuButton'>
            <a class='dropdown-item editPatientButton' id='${patient + "-editButton"}' href='#'>Edit</a>
            <a class='dropdown-item deletePatientButton' id='${patient + "-deleteButton"}' href='#'>Delete</a>
            </div>
        </div>`)
        $('#patients-table').DataTable().row.add(tableRow);
    }
    $('#patients-table').DataTable().draw(false);


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

    if(initial){
        readManageDropdownData()

        //Initialize multi selects
        $('#chiefComplainInput').multiSelect();
        $('#testCaseInput').multiSelect();
        $('#adviceInput').multiSelect();
        // $('#reviewInput').multiSelect();

        $('#chiefComplainInputEdit').multiSelect();
        $('#testCaseInputEdit').multiSelect();
        $('#adviceInputEdit').multiSelect();
        // $('#reviewInputEdit').multiSelect();
    }
}

$(document).ready(function(){
    readData(true)
})

$('#medicine-table').on('page.dt', function () {
    formatSideEffects(table.page.info().page)
});


function formatSideEffects(page = 0) {
    var table = document.getElementById('medicine-table');
    let i = 0;
    for (let row of table.rows) {
        if (i++ === 0 || row.childNodes[0].classList[0] === 'dataTables_empty') continue;
        let id = row.childNodes[0].innerHTML
        let sideEffect = row.childNodes[11].innerHTML
        let shop = row.childNodes[12].innerHTML

        let use = row.childNodes[10].innerHTML
        let comp = row.childNodes[4].innerHTML
        let instruction = row.childNodes[8].innerHTML
        let cls = row.childNodes[9].innerHTML
        let manufacturer = row.childNodes[3].innerHTML

        if (sideEffect.startsWith('<div onmouseover=') || use.startsWith('<div onmouseover=') || comp.startsWith('<div onmouseover=') || instruction.startsWith('<div onmouseover=') || cls.startsWith('<div onmouseover=') || manufacturer.startsWith('<div onmouseover=') || shop.startsWith('<div onmouseover=')) {
            continue
        }

        let modifiedSideEffect = sideEffect
        let modifiedShop = shop
        let modifiedUse = use
        let modifiedComp = comp
        let modifiedInstruction = instruction
        let modifiedClass = cls
        let modifiedManufacturer = manufacturer

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

        if (modifiedManufacturer.length > 15) {
            modifiedManufacturer = modifiedManufacturer.substr(0, 11)
            modifiedManufacturer = modifiedManufacturer + '...'
            modifiedManufacturer = '<div onmouseover="showManufacturerTooltip(' + id + ')" onmouseleave="hideManufacturerTooltip(' + id + ')" class="sideEffectTd" id="manufacturerTd' + id + '">' + modifiedManufacturer + ' <p lang="en" class="sideEffectTooltip" id="manufacturerTooltip' + id + '">' + manufacturer + '</p></div>'
        }

        if (modifiedShop.length > 15) {
            modifiedShop = modifiedShop.substr(0, 11)
            modifiedShop = modifiedShop + '...'
            modifiedShop = '<div onmouseover="showShopTooltip(' + id + ')" onmouseleave="hideShopTooltip(' + id + ')" class="sideEffectTd" id="shopTd' + id + '">' + modifiedShop + ' <p lang="en" class="sideEffectTooltip" id="shopTooltip' + id + '">' + shop + '</p></div>'
        }

        row.childNodes[11].innerHTML = modifiedSideEffect
        row.childNodes[12].innerHTML = modifiedShop
        row.childNodes[10].innerHTML = modifiedUse
        row.childNodes[4].innerHTML = modifiedComp
        row.childNodes[8].innerHTML = modifiedInstruction
        row.childNodes[9].innerHTML = modifiedClass
        row.childNodes[3].innerHTML = modifiedManufacturer
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
                delete cases[caseId]
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

    let chiefComplain = caseToBeEdited.chiefComplain.length === 1 && caseToBeEdited.chiefComplain[0] === ""? [] : caseToBeEdited.chiefComplain
    let advice = caseToBeEdited.advice.length === 1 && caseToBeEdited.advice[0] === ""? [] : caseToBeEdited.advice
    let test = caseToBeEdited.test.length === 1 && caseToBeEdited.test[0] === ""? [] : caseToBeEdited.test

    $('#caseNameInputEdit').val(caseToBeEdited.case);
    $('#dateInputEdit').val(caseToBeEdited.date);
    $('#ageInputEdit').val(caseToBeEdited.age);
    $('#genderInputEdit').val(caseToBeEdited.gender);
    $('#bpInputEdit').val(caseToBeEdited.bloodPressure);
    $('#pulseInputEdit').val(caseToBeEdited.pulse);
    $('#temperatureInputEdit').val(caseToBeEdited.temperature);
    $('#spo2InputEdit').val(caseToBeEdited.spo2);
    $('#weightInputEdit').val(caseToBeEdited.weight);
    $('#chiefComplainInputEdit').val(chiefComplain);
    $('#historyInputEdit').val(caseToBeEdited.history);
    $('#medicationInputEdit').val(caseToBeEdited.medication);
    $('#testCaseInputEdit').val(test);
    $('#adviceInputEdit').val(advice);
    $('#reviewInputEdit').val(caseToBeEdited.review);
    $('#noteInputEdit').val(caseToBeEdited.note);
    $('#caseIdInputEdit').val(caseId);
    $('#casesEditModal').modal('show')

    $(function () {
        $('#chiefComplainInputEdit').multiSelect().trigger('change');
        $('#testCaseInputEdit').multiSelect().trigger('change');
        $('#adviceInputEdit').multiSelect().trigger('change');
        // $('#reviewInputEdit').multiSelect().trigger('change');
    });
})

$('#cases_container').on('click', '.openCaseButton', function (e) {
    let caseId = e.target.id.split('-')[0]
    var p = path.join(docsPath, '/medicines/cases.json');
    let cases = JSON.parse(fs.readFileSync(p, 'utf-8'))
    let selectedCase = cases[caseId]

    let chiefComplain = "<ol>"
    for(let cc of selectedCase.chiefComplain){
        chiefComplain += `<li>${cc}</li>`
    }
    chiefComplain += '</ol>'

    let medication = "<ol>"
    for(let med of selectedCase.medication.split('\n')){
        medication += `<li>${med}</li>`
    }
    medication += '</ol>'

    let history = "<ol>"
    for(let hist of selectedCase.history.split('\n')){
        history += `<li>${hist}</li>`
    }
    history += '</ol>'

    let tests = "<ol>"
    for(let t of selectedCase.test){
        tests += `<li>${t}</li>`
    }
    tests += '</ol>'

    let advice = "<ol>"
    for(let adv of selectedCase.advice){
        advice += `<li>${adv}</li>`
    }
    advice += '</ol>'

    let review = "<ol>"
    for(let rev of selectedCase.review.split('\n')){
        review += `<li>${rev}</li>`
    }
    review += '</ol>'

    let note = "<ol>"
    for(let nt of selectedCase.note.split('\n')){
        note += `<li>${nt}</li>`
    }
    note += '</ol>'

    let d = new Date(selectedCase.date)
    d = d.toLocaleDateString('en-IN')

    $('#caseDateValue').html(d);
    $('#caseAgeValue').html(selectedCase.age);
    $('#caseGenderValue').html(selectedCase.gender && selectedCase.gender.toUpperCase());
    $('#caseBPValue').html(selectedCase.bloodPressure);
    $('#casePulseValue').html(selectedCase.pulse);
    $('#caseTempValue').html(selectedCase.temperature);
    $('#caseSPO2Value').html(selectedCase.spo2);
    $('#caseWeightValue').html(selectedCase.weight);
    $('#caseCCValue').html(chiefComplain);
    $('#caseMedicationValue').html(medication);
    $('#caseHistoryValue').html(history);
    $('#casetestValue').html(tests);
    $('#caseAdviceValue').html(advice);
    $('#caseReviewValue').html(review);
    $('#caseNoteValue').html(note);
    $('#case-open-title').html(selectedCase.case);
    $('#casesOpenModal').modal('show')
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
    var weight = $('#weightInput').val();
    var chiefComplain = $('#chiefComplainInput').val();
    var history = $('#historyInput').val();
    var medication = $('#medicationInput').val();
    var test = $('#testCaseInput').val();
    var advice = $('#adviceInput').val();
    var review = $('#reviewInput').val();
    var note = $('#noteInput').val();

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
        "weight": weight,
        "chiefComplain": chiefComplain || null,
        "history": history,
        "medication": medication,
        "test": test || null,
        "advice": advice  || null,
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

$('#update-case-btn').click(function () {
    var _case = $('#caseNameInputEdit').val();
    var date = $('#dateInputEdit').val();
    var age = $('#ageInputEdit').val();
    var gender = $('#genderInputEdit').val();
    var bloodPressure = $('#bpInputEdit').val();
    var pulse = $('#pulseInputEdit').val();
    var temperature = $('#temperatureInputEdit').val();
    var spo2 = $('#spo2InputEdit').val();
    var weight = $('#weightInputEdit').val();
    var chiefComplain = $('#chiefComplainInputEdit').val();
    var history = $('#historyInputEdit').val();
    var medication = $('#medicationInputEdit').val();
    var test = $('#testCaseInputEdit').val();
    var advice = $('#adviceInputEdit').val();
    var review = $('#reviewInputEdit').val();
    var note = $('#noteInputEdit').val();
    var caseToBeEdited = $('#caseIdInputEdit').val();

    // update goes here
    var p = path.join(docsPath, '/medicines/cases.json');
    let cases = JSON.parse(fs.readFileSync(p, 'utf-8'))

    cases[caseToBeEdited] = {
        "case": _case,
        "date": date,
        "age": age,
        "gender": gender,
        "bloodPressure": bloodPressure,
        "pulse": pulse,
        "temperature": temperature,
        "spo2": spo2,
        "weight": weight,
        "chiefComplain": chiefComplain || "default",
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
        detail: "Case was successfully updated."
    };

    dialog.showMessageBox(null, options);
    $('#casesEditModal :input').val('');
})

/*******************************************************************/
/*********                 PATIENTS ELEMENTS              **********/
/*******************************************************************/

$('#patients_container').on('click', '.editPatientButton', function (e) {
    let patientId = e.target.id.split('-')[0]
    var p = path.join(docsPath, '/medicines/patients.json');
    let patients = JSON.parse(fs.readFileSync(p, 'utf-8'))
    let patientToBeEdited = patients[patientId]

    $('#patUPIDInputEdit').val(patientToBeEdited.UPID);
    $('#patDateInputEdit').val(patientToBeEdited.date);
    $('#patTimeInputEdit').val(patientToBeEdited.time);
    $('#patCaseInputEdit').val(patientToBeEdited.case);
    $('#patNameInputEdit').val(patientToBeEdited.name);
    $('#patAgeAndGenderInputEdit').val(patientToBeEdited.ageAndGender);
    $('#patPlaceInputEdit').val(patientToBeEdited.place);
    $('#patMobileInputEdit').val(patientToBeEdited.mobile);
    $('#patCfSelectEdit').val(patientToBeEdited.cf);
    $('#patientIdInputEdit').val(patientId);
    $('#patientsEditModal').modal('show')
})

$('#update-patient-btn').click(function () {
    var upid = $('#patUPIDInputEdit').val();
    var date = $('#patDateInputEdit').val();
    var time = $('#patTimeInputEdit').val();
    var name = $('#patNameInputEdit').val();
    var _case = $('#patCaseInputEdit').val();
    var ageAndGender = $('#patAgeAndGenderInputEdit').val();
    var place = $('#patPlaceInputEdit').val();
    var mobile = $('#patMobileInputEdit').val();
    var cf = $('#patCfSelectEdit').val();
    var patientToBeEdited = $('#patientIdInputEdit').val();

    //save goes here
    var p = path.join(docsPath, '/medicines/patients.json');
    let patients = JSON.parse(fs.readFileSync(p, 'utf-8'))
    patients[patientToBeEdited] = {
        "UPID": upid,
        "date": date,
        "time": time,
        "case": _case,
        "name": name,
        "ageAndGender": ageAndGender,
        "place": place,
        "mobile": mobile,
        "cf": cf
    }

    fs.writeFileSync(p, JSON.stringify(patients))
    readData()
    const options = {
        type: 'info',
        title: 'Success',
        message: 'Success!',
        detail: "Patient was successfully saved."
    };
    dialog.showMessageBox(null, options);
    $('#patientsEditModal :input').val('');
    $('#patCfSelectEdit').val('Choose CF');
})


$('#patients_container').on('click', '.deletePatientButton', function (e) {
    let patientId = e.target.id.split('-')[0]
    var p = path.join(docsPath, '/medicines/patients.json');
    let patients = JSON.parse(fs.readFileSync(p, 'utf-8'))
    let patientToBeDeleted = patients[patientId]

    const options = {
        type: 'question',
        buttons: ["Delete", "Cancel"],
        title: 'Success',
        message: 'Sure to delete patient having UPID ' + patientToBeDeleted.UPID + '?',
        detail: "Once deleted, this action cannot be undone."
    };
    dialog.showMessageBox(null, options)
        .then((s) => {
            if (s.response === 0) {
                delete patients[patientId]
                $('#toastText').html('Patient having UPID <strong>' + patientToBeDeleted.UPID + '</strong>' + ' was successfully deleted.')
                fs.writeFileSync(p, JSON.stringify(patients))
                readData()
                $('#deleteToast').toast('show')
            }
        })
})

/*******************************************************************/
/*********                 DROPDOWN ELEMENTS              **********/
/*******************************************************************/

$('#addTypeBtn').click(function () {
    addDropDownItem({
        name: "Type",
        inputId: "addtype",
        fileName: "types.json",
        fileKey: "types",
        formInputId: "typeSelect"
    })
})

$('#addRouteBtn').click(function () {
    addDropDownItem({
        name: "Route",
        inputId: "addRoute",
        fileName: "routes.json",
        fileKey: "routes",
        formInputId: "routeInput"
    })
})

$('#addInstructionBtn').click(function () {
    addDropDownItem({
        name: "Instruction",
        inputId: "addInstruction",
        fileName: "instructions.json",
        fileKey: "instructions",
        formInputId: "instructionInput"
    })
})

$('#addPerBtn').click(function () {
    addDropDownItem({
        name: "Per",
        inputId: "addPer",
        fileName: "per.json",
        fileKey: "per",
        formInputId: "unitInput"
    })
})

$('#addShopsBtn').click(function () {
    addDropDownItem({
        name: "Shop",
        inputId: "addShops",
        fileName: "shop.json",
        fileKey: "shop",
        formInputId: "shopsInput"
    })
})

$('#addManufacturerBtn').click(function () {
    addDropDownItem({
        name: "Manufacturer",
        inputId: "addManufacturer",
        fileName: "manufacturer.json",
        fileKey: "manufacturer",
        formInputId: "manufacturerInput"
    })
})

$('#addChiefComplainBtn').click(function () {
    addDropDownItem({
        name: "ChiefComplain",
        inputId: "addChiefComplain",
        fileName: "chiefComplain.json",
        fileKey: "chiefComplain",
        formInputId: "chiefComplainInput",
        isMultiSelect: true
    })
})

$('#addTestCaseBtn').click(function () {
    addDropDownItem({
        name: "Test",
        inputId: "addTestCase",
        fileName: "test.json",
        fileKey: "test",
        formInputId: "testCaseInput",
        isMultiSelect: true
    })
})

$('#addAdviceBtn').click(function () {
    addDropDownItem({
        name: "Advice",
        inputId: "addAdvice",
        fileName: "advice.json",
        fileKey: "advice",
        formInputId: "adviceInput",
        isMultiSelect: true
    })
})

$('#addCFBtn').click(function () {
    addDropDownItem({
        name: "CF",
        inputId: "addCF",
        fileName: "cf.json",
        fileKey: "cf",
        formInputId: "patCfSelect",
        isMultiSelect: false
    })
})

// $('#addReviewBtn').click(function () {
//     addDropDownItem({
//         name: "Review",
//         inputId: "addReview",
//         fileName: "review.json",
//         fileKey: "review",
//         formInputId: "reviewInput",
//         isMultiSelect: true
//     })
// })

$('#editTypeBtn').click(function () {
    editDropDownItem({
        name: "Type",
        inputId: "editTypeSelect",
        newInputId: "editTypeDD",
        fileName: "types.json",
        fileKey: "types",
        type: "medicines",
        formInputId: "typeSelect",
        dataKey: 'type'
    })
})

$('#editRouteBtn').click(function () {
    editDropDownItem({
        name: "Route",
        inputId: "editRouteSelect",
        newInputId: "editRouteDD",
        fileName: "routes.json",
        fileKey: "routes",
        type: "medicines",
        formInputId: "routeInput",
        dataKey: "route"
    })
})

$('#editInstructionBtn').click(function () {
    editDropDownItem({
        name: "Instruction",
        inputId: "editInstructionSelect",
        newInputId: "editInstructionDD",
        fileName: "instructions.json",
        fileKey: "instructions",
        type: "medicines",
        formInputId: "instructionInput",
        dataKey: "instructions"
    })
})

$('#editPerBtn').click(function () {
    editDropDownItem({
        name: "Per",
        inputId: "editPerSelect",
        newInputId: "editPerDD",
        fileName: "per.json",
        fileKey: "per",
        type: "medicines",
        formInputId: "unitInput",
        dataKey: "per"
    })
})

$('#editShopBtn').click(function () {
    editDropDownItem({
        name: "Shop",
        inputId: "editShopSelect",
        newInputId: "editShopDD",
        fileName: "shop.json",
        fileKey: "shop",
        type: "medicines",
        formInputId: "shopsInput",
        dataKey: "shop"
    })
})

$('#editManufacturerBtn').click(function () {
    editDropDownItem({
        name: "Manufacturer",
        inputId: "editManufacturerSelect",
        newInputId: "editManufacturerDD",
        fileName: "manufacturer.json",
        fileKey: "manufacturer",
        type: "medicines",
        formInputId: "manufacturerInput",
        dataKey: "manufacturer"
    })
})

$('#editChiefComplainBtn').click(function () {
    editDropDownItem({
        name: "Chief Complain",
        inputId: "editChiefComplainSelect",
        newInputId: "editChiefComplainDD",
        fileName: "chiefComplain.json",
        fileKey: "chiefComplain",
        type: "cases",
        dataKey: "chiefComplain",
        formInputId: "chiefComplainInput",
        isMultiSelect: true
    })
})

$('#editTestCaseBtn').click(function () {
    editDropDownItem({
        name: "Test",
        inputId: "editTestSelect",
        newInputId: "editTestCaseDD",
        fileName: "test.json",
        fileKey: "test",
        type: "cases",
        dataKey: "test",
        formInputId: "testCaseInput",
        isMultiSelect: true
    })
})

$('#editAdviceBtn').click(function () {
    editDropDownItem({
        name: "Advice",
        inputId: "editAdviceSelect",
        newInputId: "editAdviceDD",
        fileName: "advice.json",
        fileKey: "advice",
        type: "cases",
        dataKey: "advice",
        formInputId: "adviceInput",
        isMultiSelect: true
    })
})

$('#editCFBtn').click(function () {
    editDropDownItem({
        name: "CF",
        inputId: "editCFSelect",
        newInputId: "editCFDD",
        fileName: "cf.json",
        fileKey: "cf",
        type: "patients",
        dataKey: "cf",
        formInputId: "patCfSelect",
        isMultiSelect: false
    })
})

// $('#editReviewBtn').click(function () {
//     editDropDownItem({
//         name: "review",
//         inputId: "editReviewSelect",
//         newInputId: "editReviewDD",
//         fileName: "review.json",
//         fileKey: "review",
//         type: "cases",
//         dataKey: "review",
//         formInputId: "reviewInput",
//         isMultiSelect: true
//     })
// })

function readManageDropdownData() {
    //CF MANAGE
    let cf = readDataFromFile({ fileName: 'cf.json', defaultData: '{"cf":["a","b"]}' })
    refreshDropdownData(cf, 'editCFSelect', 'cf')
    refreshDropdownData(cf, 'patCfSelectEdit', 'cf')
    refreshDropdownData(cf, 'patCfSelect', 'cf')

    //TYPES MANAGE
    let types = readDataFromFile({ fileName: 'types.json', defaultData: '{"types":[]}' })
    refreshDropdownData(types, 'editTypeSelect', 'types')
    refreshDropdownData(types, 'typeSelect', 'types')
    refreshDropdownData(types, 'typeSelectEdit', 'types')

    //ROUTES MANAGE
    let routes = readDataFromFile({ fileName: 'routes.json', defaultData: '{"routes":[]}' })
    refreshDropdownData(routes, 'editRouteSelect', "routes")
    refreshDropdownData(routes, 'routeInput', 'routes')
    refreshDropdownData(routes, 'routeInputEdit', 'routes')

    //INSTRUCTIONS MANAGE
    let instructions = readDataFromFile({ fileName: 'instructions.json', defaultData: '{"instructions":[]}' })
    refreshDropdownData(instructions, 'editInstructionSelect', 'instructions')
    refreshDropdownData(instructions, 'instructionInput', 'instructions')
    refreshDropdownData(instructions, 'instructionInputEdit', 'instructions')

    //PER MANAGE
    let per = readDataFromFile({ fileName: 'per.json', defaultData: '{"per":[]}' })
    refreshDropdownData(per, 'editPerSelect', 'per')
    refreshDropdownData(per, 'unitInput', 'per')
    refreshDropdownData(per, 'unitInputEdit', 'per')

    //SHOP MANAGE
    let shop = readDataFromFile({ fileName: 'shop.json', defaultData: '{"shop":[]}' })
    refreshDropdownData(shop, 'editShopSelect', 'shop')
    refreshDropdownData(shop, 'shopsInput', 'shop')
    refreshDropdownData(shop, 'shopsInputEdit', 'shop')

    //MANUFACTURER MANAGE
    let manufacturer = readDataFromFile({ fileName: 'manufacturer.json', defaultData: '{"manufacturer":[]}' })
    refreshDropdownData(manufacturer, 'editManufacturerSelect', 'manufacturer')
    refreshDropdownData(manufacturer, 'manufacturerInput', 'manufacturer')
    refreshDropdownData(manufacturer, 'manufacturerInputEdit', 'manufacturer')

    //CHIEF COMPLAIN MANAGE
    let chiefComplain = readDataFromFile({ fileName: 'chiefComplain.json', defaultData: '{"chiefComplain":[]}' })
    refreshDropdownData(chiefComplain, 'editChiefComplainSelect', 'chiefComplain')
    refreshDropdownData(chiefComplain, 'chiefComplainInput', 'chiefComplain', true)
    refreshDropdownData(chiefComplain, 'chiefComplainInputEdit', 'chiefComplain', true)

    //TEST MANAGE
    let test = readDataFromFile({ fileName: 'test.json', defaultData: '{"test":[]}' })
    refreshDropdownData(test, 'editTestSelect', 'test')
    refreshDropdownData(test, 'testCaseInput', 'test', true)
    refreshDropdownData(test, 'testCaseInputEdit', 'test', true)

    //ADVICE MANAGE
    let advice = readDataFromFile({ fileName: 'advice.json', defaultData: '{"advice":[]}' })
    refreshDropdownData(advice, 'editAdviceSelect', 'advice')
    refreshDropdownData(advice, 'adviceInput', 'advice', true)
    refreshDropdownData(advice, 'adviceInputEdit', 'advice', true)

    //REVIEW MANAGE
    // let review = readDataFromFile({ fileName: 'review.json', defaultData: '{"review":[]}' })
    // refreshDropdownData(review, 'editReviewSelect', 'review')
    // refreshDropdownData(review, 'reviewInput', 'review', true)
    // refreshDropdownData(review, 'reviewInputEdit', 'review', true)
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

function refreshDropdownData(data, id, key, isMultiSelect = false) {
    let val = $('#'+id).val()
    var select = document.getElementById(id);
    select.options.length = 1;
    for (let [i, type] of data[key].entries()) {
        let option = new Option(type, type)
        select.options[select.options.length] = option;
        option.setAttribute("id", id+"_"+i)
    }
    if (isMultiSelect) {
        $(function () {
            $('#'+id).multiSelect().trigger('change');
        });

        $('#'+id).val(val)
    }
}

function addDropDownItem(options) {
    name = options.name
    inputId = options.inputId
    value = options.value
    fileName = options.fileName
    fileKey = options.fileKey
    formInputId = options.formInputId
    isMultiSelect = options.isMultiSelect

    let newVal = value? value: $('#' + inputId).val()
    if (!newVal) {
        dialog.showErrorBox("Error", "Please fill in the name of the new '"+name+"'.")
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

    //Update dropdown data
    refreshDropdownData(data, 'edit' + name + 'Select', fileKey)
    refreshDropdownData(data, formInputId, fileKey, isMultiSelect)
    refreshDropdownData(data, formInputId+"Edit", fileKey, isMultiSelect)
    
    //Show success message
    $('#' + inputId).val('')
    const msgOptions = {
        type: 'info',
        title: 'Success',
        message: 'Success!',
        detail: "The " + name + " '" + newVal + "' was successfully saved."
    };
    dialog.showMessageBox(null, msgOptions);
}

function editDropDownItem(options) {
    let name = options.name
    let inputId = options.inputId
    let editInputId = options.newInputId
    let fileName = options.fileName
    let fileKey = options.fileKey
    let type = options.type
    let formInputId = options.formInputId
    let isMultiSelect = options.isMultiSelect

    let buttonId = editInputId.substr(0, editInputId.length - 2) + "Btn"
    let buttonContent = $('#'+buttonId).html()

    let editId = $('#' + inputId).val()
    let editName = $('#' + inputId + ' option:selected').text()
    let editedvalue = $('#' + editInputId).val()

    if (!editId || editId === 'default' || !editedvalue) {
        dialog.showErrorBox("Error", "One or more required field is empty. Choose the "+name+" to be edited and the new value of that "+name+".")
        return
    }

    $('#'+buttonId).html("Please wait...")
    $('#'+buttonId).prop('disabled', true)

    var p = path.join(docsPath, '/medicines/' + fileName);
    let data = JSON.parse(fs.readFileSync(p, 'utf-8'))

    //Edit and write to file
    let elemIndex = data[fileKey].indexOf(editName)
    data[fileKey][elemIndex] = editedvalue
    fs.writeFileSync(p, JSON.stringify(data))

    updateDropDownFieldInElements(type, options.dataKey, editName, editedvalue)

    //Refresh all dropdowns
    refreshDropdownData(data, inputId, fileKey)
    refreshDropdownData(data, formInputId, fileKey, isMultiSelect)
    refreshDropdownData(data, formInputId+"Edit", fileKey, isMultiSelect)

    //Show success message
    $('#' + inputId).val('default')
    $('#' + editInputId).val('')
    $('#'+buttonId).html(buttonContent)
    $('#'+buttonId).prop("disabled", false)
    const msgOptions = {
        type: 'info',
        title: 'Success',
        message: 'Success!',
        detail: "The " + name + " '" + editName + "' was successfully edited."
    };
    dialog.showMessageBox(null, msgOptions);
}

function updateDropDownFieldInElements(type, dataKey, oldValue, newValue){
    var p = path.join(docsPath, '/medicines/'+type+'.json');
    let data = JSON.parse(fs.readFileSync(p, 'utf-8'))

    for( let row in data){
        if(Array.isArray(data[row][dataKey])){
            for(let [i, val] of data[row][dataKey].entries()){
                if(val == oldValue) data[row][dataKey][i] = newValue
            }
        }else if(data[row][dataKey] === oldValue){
            data[row][dataKey] = newValue
        }
    }

    fs.writeFileSync(p, JSON.stringify(data))

    readData()
}


/*******************************************************************/
/*********                 ADD FROM MODAL                **********/
/*******************************************************************/

$('#addChiefComplainFromModal').click(function () {
    prompt({
        title: 'Add chief Complain',
        label: 'New Chief Complain:',
        inputAttrs: {
            type: 'text',
            required: true
        },
        type: 'input',
        alwaysOnTop: true
    })
    .then((r) => {
        if(!r){
            console.info("Cancel addChiefComplainFromModal prompt")
        }else{
            addDropDownItem({
                name: "ChiefComplain",
                value: r,
                fileName: "chiefComplain.json",
                fileKey: "chiefComplain",
                formInputId: "chiefComplainInput",
                isMultiSelect: true
            })
        }
    })
    .catch(console.error);
})

$('#addTestCaseFromModal').click(function () {
    prompt({
        title: 'Add new test',
        label: 'Test name:',
        inputAttrs: {
            type: 'text',
            required: true
        },
        type: 'input',
        alwaysOnTop: true
    })
    .then((r) => {
        if(!r){
            console.info("Cancel addTestCaseFromModal prompt")
        }else{
            addDropDownItem({
                name: "Test",
                value: r,
                fileName: "test.json",
                fileKey: "test",
                formInputId: "testCaseInput",
                isMultiSelect: true
            })
        }
    })
    .catch(console.error);
})

$('#addAdviceFromModal').click(function () {
    prompt({
        title: 'Add new advice',
        label: 'Advice name:',
        inputAttrs: {
            type: 'text',
            required: true
        },
        type: 'input',
        alwaysOnTop: true
    })
    .then((r) => {
        if(!r){
            console.info("Cancel addAdviceFromModal prompt")
        }else{
            addDropDownItem({
                name: "Advice",
                value: r,
                fileName: "advice.json",
                fileKey: "advice",
                formInputId: "adviceInput",
                isMultiSelect: true
            })
        }
    })
    .catch(console.error);
})

$('#addChiefComplainFromEditModal').click(function () {
    prompt({
        title: 'Add chief Complain',
        label: 'New Chief Complain:',
        inputAttrs: {
            type: 'text',
            required: true
        },
        type: 'input',
        alwaysOnTop: true
    })
    .then((r) => {
        if(!r){
            console.info("Cancel addChiefComplainFromModal prompt")
        }else{
            addDropDownItem({
                name: "ChiefComplain",
                value: r,
                fileName: "chiefComplain.json",
                fileKey: "chiefComplain",
                formInputId: "chiefComplainInput",
                isMultiSelect: true
            })
        }
    })
    .catch(console.error);
})

$('#addTestCaseFromEditModal').click(function () {
    prompt({
        title: 'Add new test',
        label: 'Test name:',
        inputAttrs: {
            type: 'text',
            required: true
        },
        type: 'input',
        alwaysOnTop: true
    })
    .then((r) => {
        if(!r){
            console.info("Cancel addTestCaseFromModal prompt")
        }else{
            addDropDownItem({
                name: "Test",
                value: r,
                fileName: "test.json",
                fileKey: "test",
                formInputId: "testCaseInput",
                isMultiSelect: true
            })
        }
    })
    .catch(console.error);
})

$('#addAdviceFromEditModal').click(function () {
    prompt({
        title: 'Add new advice',
        label: 'Advice name:',
        inputAttrs: {
            type: 'text',
            required: true
        },
        type: 'input',
        alwaysOnTop: true
    })
    .then((r) => {
        if(!r){
            console.info("Cancel addAdviceFromModal prompt")
        }else{
            addDropDownItem({
                name: "Advice",
                value: r,
                fileName: "advice.json",
                fileKey: "advice",
                formInputId: "adviceInput",
                isMultiSelect: true
            })
        }
    })
    .catch(console.error);
})