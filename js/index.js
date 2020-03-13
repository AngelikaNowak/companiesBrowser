$(function () {

    $.ajax('https://recruitment.hal.skygate.io/companies')
        .done(function (companies) {

            Promise.all(companies.map(company => $.ajax('https://recruitment.hal.skygate.io/incomes/' + company.id)))

                .then(incomesOfAllCompanies => {

                    companies.forEach((company, i) => {
                        let incomesOfCompany = incomesOfAllCompanies[i];

                        let totalIncomeInMinorUnits = incomesOfCompany.incomes
                            .reduce((totalIncome, nextIncome) => totalIncome + parseInt(parseFloat(nextIncome.value) * 100), 0);

                        company.totalIncome = (totalIncomeInMinorUnits / 100).toFixed(2)

                    });

                    $('#companiesTable').DataTable({
                        data: companies,
                        order: [[3, "desc"]],
                        columns: [
                            {data: "id", title: "ID"},
                            {data: "name", title: "Name"},
                            {data: "city", title: "City"},
                            {data: "totalIncome", title: "Total Income"}
                        ]
                    });
                })


        })
        .fail(function (error) {
            console.log(error);
        });
});

