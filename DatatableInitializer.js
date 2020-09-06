'use strict';

import 'datatables.net-dt'
import 'datatables.net-select-dt'

class DatatableInitializer {
    get sLengthMenuTitle() {
        return this._sLengthMenuTitle;
    }

    get sZeroRecordsTitle() {
        return this._sZeroRecordsTitle;
    }

    set sZeroRecordsTitle(value) {
        this._sZeroRecordsTitle = value;
    }

    get processingTitle() {
        return this._processingTitle;
    }

    set processingTitle(value) {
        this._processingTitle = value;
    }

    get columnsWithSearchingCheckboxesValues() {
        return this._columnsWithSearchingCheckboxesValues;
    }

    set columnsWithSearchingCheckboxesValues(value) {
        this._columnsWithSearchingCheckboxesValues = value;
    }

    get columnsWithSearchingSelectorValues() {
        return this._columnsWithSearchingSelectorValues;
    }

    set columnsWithSearchingSelectorValues(value) {
        this._columnsWithSearchingSelectorValues = value;
    }

    get columnsWithSearchingCheckboxes() {
        return this._columnsWithSearchingCheckboxes;
    }

    set columnsWithSearchingCheckboxes(value) {
        this._columnsWithSearchingCheckboxes = value;
    }

    get searchTitle() {
        return this._searchTitle;
    }

    set searchTitle(value) {
        this._searchTitle = value;
    }

    get dataTable() {
        return this._dataTable;
    }

    set dataTable(value) {
        this._dataTable = value;
    }

    get isWithCheckboxes() {
        return this._isWithCheckboxes;
    }

    set isWithCheckboxes(value) {
        this._isWithCheckboxes = value;
    }

    get columnsWithSearchingSelector() {
        return this._columnsWithSearchingSelector;
    }

    set columnsWithSearchingSelector(value) {
        this._columnsWithSearchingSelector = value;
    }

    set columnsWithSearchingInput(value) {
        this._columnsWithSearchingInput = value;
    }

    get columnsWithSearchingInput() {
        return this._columnsWithSearchingInput;
    }

    get table() {
        return this._table;
    }

    get columnDefs() {
        if (this.isWithCheckboxes) {
            return this._columnDefs.concat([
                {
                    orderable: false,
                    className: 'select-checkbox',
                    targets: 0,
                    "render": function () {
                        return ''
                    }
                }
            ]);
        }
        return this._columnDefs;
    }

    get columns() {
        if (this.isWithCheckboxes) {
            return [
                {
                    data: null
                }
            ].concat(this._columns);
        }
        return this._columns;
    }

    set columns(value) {
        this._columns = value;
    }

    set columnDefs(value) {
        this._columnDefs = value;
    }

    constructor(
        table
    ) {
        this._table = table;
        this._dataTable = null;
        this._columns = [];
        this._columnDefs = [];
        this._columnsWithSearchingInput = [];
        this._columnsWithSearchingSelector = [];
        this._columnsWithSearchingCheckboxes = [];
        this._columnsWithSearchingSelectorValues = [];
        this._columnsWithSearchingCheckboxesValues = [];
        this._isWithCheckboxes = false;
        this.initLanguageTitles();
    }

    initLanguageTitles() {
        this._searchTitle = 'Szukaj';
        this._processingTitle = 'Przetwarzanie';
        this._sZeroRecordsTitle = 'Nie znaleziono pasujących rekordów';
        this._sLengthMenuTitle = 'Wyświetl _MENU_ rekordów';
    }

    initDatatable() {
        var self = this;
        this.dataTable = this._table.DataTable({
            processing: true,
            orderCellsTop: true,
            fixedHeader: true,
            "responsive:": true,
            "bInfo": false,
            'language': {
                search: this.searchTitle,
                processing: self.processingTitle
            },
            "oLanguage": {
                "oPaginate": {
                    "sNext": ">",
                    "sPrevious": "<"
                },
                "sLengthMenu": self.sLengthMenuTitle,
                "sZeroRecords": self.sZeroRecordsTitle
            },

            ajax: {
                url: this._table.data('url'),
                dataFilter: function (data) {
                    data = $.parseJSON(data);

                    return JSON.stringify({
                        recordsTotal: data.length,
                        recordsFiltered: data.length,
                        data: data
                    });
                }
            },
            "columns": this.columns,
            columnDefs: this.columnDefs,
            select: {
                style: 'os',
                selector: 'td:first-child'
            },

            order: [[1, 'asc']],
            initComplete: function () {
                if (self.columnsWithSearchingSelector.length > 0) {
                    self.addSearchingSelectors(self.columnsWithSearchingSelector, this);
                }

                if (self.columnsWithSearchingInput.length > 0) {
                    self.addSearchingInputs(self.columnsWithSearchingInput, this);
                }

                if (self.columnsWithSearchingCheckboxes.length > 0) {
                    self.addSearchingCheckboxes(self.columnsWithSearchingCheckboxes, this);
                }
            }
        });
    }

    addSearchingInputs(columnsWithSearchingInput, datatable) {
        datatable.api().columns().every(function (key) {
            if (!columnsWithSearchingInput.includes(key)) {
                return;
            }
            var column = this;
            $('<input type="text" class="data-table-laz-searching-input" placeholder="Szukaj" />')
                .appendTo($(column.header()))
                .on('keyup change', function (e) {
                    e.stopPropagation();
                    if (column.search() !== this.value) {
                        column
                            .search(this.value)
                            .draw();
                    }
                })
                .on('click', (e) => e.stopPropagation());

        });
    }

    addSearchingSelectors(columnsWithSearchingSelector, datatable) {
        var self = this;
        datatable.api().columns().every(function (key) {
            if (!columnsWithSearchingSelector.includes(key)) {
                return;
            }
            var column = this;
            var select = $('<br /><select class="data-table-laz-searching-select"><option value=""></option></select>')
                .appendTo($(column.header()))
                .on('change', function (e) {
                    e.stopPropagation();
                    var val = $.fn.dataTable.util.escapeRegex(
                        $(this).val()
                    );

                    column
                        .search(val ? '^' + val + '$' : '', true, false)
                        .draw();
                })
                .on('click', (e) => e.stopPropagation());

            if (typeof self.columnsWithSearchingSelectorValues[key] === 'undefined') {
                column.data().unique().sort().each(function (d) {
                    select.append(`<option value="${d}">${d}</option>`)
                });
            } else {
                self.columnsWithSearchingSelectorValues[key].forEach(function (d) {
                    select.append(
                        `select.append('<option value="${d}">${d}</option>')`
                    )
                });
            }
        });
    }

    addSearchingCheckboxes(columnsWithSearchingCheckboxes, datatable) {
        var self = this;
        datatable.api().columns().every(function (key) {
            if (!columnsWithSearchingCheckboxes.includes(key)) {
                return;
            }
            var column = this;
            var searchingCheckboxesDiv = $('<br /><div class="data-table-laz-searching-checkboxes-div"></div>')
                .appendTo($(column.header()))
                .on('change', function (e) {
                    let selectedValues = [];

                    $(this).find('input[type="checkbox"]:checked').each(function () {
                        let value = $.fn.dataTable.util.escapeRegex($(this).val());
                        selectedValues.push(value ? '^' + value + '$' : '');
                    })
                    let joinedValues = selectedValues.join('|');
                    console.log(joinedValues);
                    column
                        .search(joinedValues, true, false)
                        .draw();
                })
                .on('click', (e) => e.stopPropagation());


            if (typeof self.columnsWithSearchingCheckboxesValues[key] === 'undefined') {
                column.data().unique().sort().each(function (d) {
                    searchingCheckboxesDiv.append(
                        `<div>
                        <input type="checkbox" class="data-table-laz-searching-checkbox" name="${d}" value="${d}">
                        <label for="${d}">${d}</label>
                      </div>`
                    )
                });
            } else {
                self.columnsWithSearchingCheckboxesValues[key].forEach(function (d) {
                    searchingCheckboxesDiv.append(
                        `<div>
                        <input type="checkbox" class="data-table-laz-searching-checkbox" name="${d}" value="${d}">
                        <label for="${d}">${d}</label>
                      </div>`
                    )
                });
            }
        });
    }
}
export default DatatableInitializer
