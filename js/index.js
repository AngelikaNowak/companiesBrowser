$(function () {

    $.ajax('https://recruitment.hal.skygate.io/companies')
        .done(function (companies) {

            Promise.all(companies.map(company => $.ajax('https://recruitment.hal.skygate.io/incomes/' + company.id)))

                .then(incomesOfAllCompanies => {

                    companies.forEach((company, i) => {
                        let incomesOfCompany = incomesOfAllCompanies[i];

                        let totalIncomeInMinorUnits = incomesOfCompany.incomes
                            .reduce(
                                (totalIncome, nextIncome) => totalIncome + parseInt(parseFloat(nextIncome.value) * 100),
                                0);

                        company.totalIncome = (totalIncomeInMinorUnits / 100)
                    });

                    $('#companiesTable')
                        .on('draw.dt', generateCompanyLinks)
                        .DataTable({
                            responsive: true,
                            data: companies,
                            order: [[3, "desc"]],
                            columns: [
                                {data: "id", title: "ID"},
                                {data: "name", title: "Name"},
                                {data: "city", title: "City"},
                                {data: "totalIncome", title: "Total Income"}
                            ]
                        });

                    function generateCompanyLinks() {
                        $('#companiesTable > tbody > tr > td:nth-child(2)')
                            .each((index, td) => {
                                td.innerHTML = `<a href="company-details.html?companyId=${(td.previousElementSibling.innerText)}">${td.innerText}</a>`
                            })
                    }

                })
        })
        .fail(function (error) {
            console.log(error);
        });

});
