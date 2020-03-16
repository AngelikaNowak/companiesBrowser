$(function () {

    const datepickerFrom = $("#datepicker_from");
    const datepickerTo = $("#datepicker_to");

    // search for company ID from URL (copied from stack overflow)
    let urlSearchParams = new URLSearchParams(document.location.search);
    const companyId = urlSearchParams.get("companyId");

    if (!companyId) {
        window.location.href = 'not-found.html'
    }

    $.ajax('https://recruitment.hal.skygate.io/companies')
        .done(companies => {

            let company = companies.find(company => company.id == companyId);

            if (!company) {
                window.location.href = 'not-found.html'
            }

            insertValueToDOM('#ID', company.id);
            insertValueToDOM('#name', company.name);
            insertValueToDOM('#city', company.city);
            document.title = company.name;

            $.ajax('https://recruitment.hal.skygate.io/incomes/' + companyId)
                .done(incomesResponse => {

                    let allIncomes = incomesResponse.incomes;

                    refreshIncomeStats();

                    // init 'From' datepicker
                    datepickerFrom.datepicker({
                        dateFormat: "yy-mm-dd",
                        onSelect: refreshIncomeStats
                    });

                    // init 'To' datepicker
                    datepickerTo.datepicker({
                        dateFormat: "yy-mm-dd",
                        onSelect: refreshIncomeStats
                    });

                    // sum incomes per month
                    let incomesPerMonth = allIncomes
                        .reduce((acc, income) => {
                            let yearMonth = yearMonthString(income.date);

                            if (acc[yearMonth] === undefined) {
                                acc[yearMonth] = parseFloat(income.value);
                            } else {
                                acc[yearMonth] = sumFloats(acc[yearMonth], parseFloat(income.value));
                            }
                            return acc;
                        }, {});

                    let months = [];
                    let monthlyIncomes = [];
                    Object.entries(incomesPerMonth).sort((a, b) => a[0] > b[0] ? 1 : -1) // copied from stack overflow
                        .forEach(pair => {
                            months.push(pair[0]);
                            monthlyIncomes.push(pair[1]);
                        });

                    insertValueToDOM('#lastMonthIncome', monthlyIncomes[monthlyIncomes.length - 1]);

                    function refreshIncomeStats() {

                        let dateFrom = datepickerFrom.datepicker('getDate');
                        let dateTo = datepickerTo.datepicker('getDate');

                        let incomes = allIncomes.filter(income => {
                            let incomeDate = new Date(income.date);
                            if (dateFrom != null && incomeDate < dateFrom) {
                                return false;
                            }
                            if (dateTo != null && incomeDate > dateTo) {
                                return false;
                            }
                            return true;
                        });

                        let totalIncome = incomes
                            .map(elem => parseFloat(elem.value))
                            .reduce((total, next) => sumFloats(total, next), 0);
                        insertValueToDOM('#totalIncome', totalIncome);

                        if (incomes.length === 0) {
                            insertValueToDOM('#averageIncome', 0);
                        } else {
                            let averageIncome = (totalIncome / incomes.length).toFixed(2);
                            insertValueToDOM('#averageIncome', averageIncome);
                        }
                    }

                    // initialize chart
                    let ctx = document.getElementById("myChart").getContext('2d');
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: months,
                            datasets: [{
                                label: 'Income per month',
                                data: monthlyIncomes,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)',
                                    'rgba(255, 159, 64, 0.2)',
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)',
                                    'rgba(255, 159, 64, 0.2)',
                                    'rgba(255, 159, 64, 0.2)',
                                ],
                                borderColor: [
                                    'rgba(255,99,132,1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)',
                                    'rgba(255,99,132,1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)',
                                    'rgba(255, 159, 64, 1)',
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: false
                                    }
                                }]
                            }
                        }
                    });
                });
        });

    function sumFloats(num1, num2) {
        return (num1 * 100 + num2 * 100) / 100;
    }

    function insertValueToDOM(selector, value) {
        $(selector).text(value);
    }

    function yearMonthString(incomeDate) {
        let date = new Date(incomeDate);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;

        return year + '-' + (month < 10 ? '0' + month : month);
    }
});
