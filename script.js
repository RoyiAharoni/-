function calculateAllTracks() {
    const tracks = [1, 2, 3];
    const summaryData = {
        'רבע': { principalPaid: 0, interestPaid: 0, remainingBalance: 0, totalAmount: 0 },
        'חצי': { principalPaid: 0, interestPaid: 0, remainingBalance: 0, totalAmount: 0 },
        'שלושה רבעים': { principalPaid: 0, interestPaid: 0, remainingBalance: 0, totalAmount: 0 },
        'סוף': { principalPaid: 0, interestPaid: 0, remainingBalance: 0, totalAmount: 0 }
    };
    const amortizationSummaryData = {};

    tracks.forEach(track => {
        const years = parseInt(document.getElementById(`years${track}`).value);
        const interest = parseFloat(document.getElementById(`interest${track}`).value);
        const amount = parseFloat(document.getElementById(`amount${track}`).value);

        if (isNaN(years) || isNaN(interest) || isNaN(amount) || years <= 0 || interest < 0 || amount <= 0) {
            document.getElementById(`result${track}`).innerHTML = '<p style="color: red;">אנא הזן ערכים תקינים וחיוביים.</p>';
            return;
        }

        const monthlyInterest = (interest / 100) / 12;
        const numberOfPayments = years * 12;
        let monthlyPayment;
        if (monthlyInterest === 0) {
            monthlyPayment = amount / numberOfPayments;
        } else {
            monthlyPayment = amount * (monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) / 
                            (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);
        }

        // לוח שפיצר מלא
        let balance = amount;
        let amortizationTableHTML = `
            <h3>לוח שפיצר מלא</h3>
            <div class="amortization-table">
                <table>
                    <tr>
                        <th>תשלום</th>
                        <th>תשלום חודשי</th>
                        <th>החזר ריבית</th>
                        <th>החזר קרן</th>
                        <th>יתרה נותרת</th>
                    </tr>
        `;

        for (let i = 1; i <= numberOfPayments; i++) {
            const interestPayment = balance * monthlyInterest;
            const principalPayment = monthlyPayment - interestPayment;
            balance -= principalPayment;

            amortizationTableHTML += `
                <tr>
                    <td>${i}</td>
                    <td>${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${interestPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${principalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
            `;

            // איסוף נתונים לטבלה המסכמת של לוח שפיצר
            if (!amortizationSummaryData[i]) {
                amortizationSummaryData[i] = { monthlyPayment: 0, interestPayment: 0, principalPayment: 0, balance: 0 };
            }
            amortizationSummaryData[i].monthlyPayment += monthlyPayment;
            amortizationSummaryData[i].interestPayment += interestPayment;
            amortizationSummaryData[i].principalPayment += principalPayment;
            amortizationSummaryData[i].balance += balance;
        }
        amortizationTableHTML += '</table></div>';

        // נקודות זמן מרכזיות
        const points = [
            { name: 'רבע', t: Math.round(numberOfPayments / 4) },
            { name: 'חצי', t: Math.round(numberOfPayments / 2) },
            { name: 'שלושה רבעים', t: Math.round(3 * numberOfPayments / 4) },
            { name: 'סוף', t: numberOfPayments }
        ];

        let summaryTableHTML = `
            <h3>פרטים בנקודות זמן מרכזיות</h3>
            <table>
                <tr>
                    <th>נקודת זמן</th>
                    <th>קרן שנפרעה</th>
                    <th>קרן שנפרעה (%)</th>
                    <th>ריבית ששולמה</th>
                    <th>יתרה נותרת</th>
                </tr>
        `;

        points.forEach(point => {
            const t = point.t;
            let remainingBalance;
            if (monthlyInterest === 0) {
                remainingBalance = amount - (monthlyPayment * t);
            } else {
                remainingBalance = amount * (Math.pow(1 + monthlyInterest, numberOfPayments) - Math.pow(1 + monthlyInterest, t)) / 
                                   (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);
            }
            const principalPaid = amount - remainingBalance;
            const interestPaid = (monthlyPayment * t) - principalPaid;

            summaryTableHTML += `
                <tr>
                    <td>${point.name}</td>
                    <td>${principalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${Math.round((principalPaid / amount) * 100)}%</td>
                    <td>${interestPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
            `;

            // הוספת נתונים לסיכום
            summaryData[point.name].principalPaid += principalPaid;
            summaryData[point.name].interestPaid += interestPaid;
            summaryData[point.name].remainingBalance += remainingBalance;
            summaryData[point.name].totalAmount += amount;
        });
        summaryTableHTML += '</table>';

        // הצגת התוצאות למסלול
        document.getElementById(`result${track}`).innerHTML = `
            <h3>מסלול ${track}</h3>
            <p>תשלום חודשי: ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ש"ח</p>
            ${summaryTableHTML}
            ${amortizationTableHTML}
        `;
    });

    // יצירת טבלה מסכמת של נקודות זמן מרכזיות
    const summaryTable = document.getElementById('summaryTable');
    summaryTable.innerHTML = `
        <tr>
            <th>נקודת זמן</th>
            <th>קרן שנפרעה</th>
            <th>קרן שנפרעה (%)</th>
            <th>ריבית ששולמה</th>
            <th>יתרה נותרת</th>
        </tr>
    `;

    ['רבע', 'חצי', 'שלושה רבעים', 'סוף'].forEach(pointName => {
        const data = summaryData[pointName];
        const totalPrincipalPaid = data.principalPaid;
        const totalInterestPaid = data.interestPaid;
        const totalRemainingBalance = data.remainingBalance;
        const totalPrincipalPaidPercentage = Math.round((totalPrincipalPaid / data.totalAmount) * 100);

        const row = summaryTable.insertRow();
        row.insertCell(0).innerText = pointName;
        row.insertCell(1).innerText = totalPrincipalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 });
        row.insertCell(2).innerText = totalPrincipalPaidPercentage + '%';
        row.insertCell(3).innerText = totalInterestPaid.toLocaleString('en-US', { minimumFractionDigits: 2 });
        row.insertCell(4).innerText = totalRemainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    });

    // יצירת טבלה מסכמת של לוח שפיצר מלא
    const amortizationSummaryTable = document.getElementById('amortizationSummaryTable');
    amortizationSummaryTable.innerHTML = `
        <tr>
            <th>חודש</th>
            <th>תשלום חודשי</th>
            <th>החזר ריבית</th>
            <th>החזר קרן</th>
            <th>יתרה נותרת</th>
        </tr>
    `;

    const maxPayments = Math.max(...Object.keys(amortizationSummaryData).map(Number));

    for (let i = 1; i <= maxPayments; i++) {
        const data = amortizationSummaryData[i] || { monthlyPayment: 0, interestPayment: 0, principalPayment: 0, balance: 0 };
        const row = amortizationSummaryTable.insertRow();
        row.insertCell(0).innerText = i;
        row.insertCell(1).innerText = data.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 });
        row.insertCell(2).innerText = data.interestPayment.toLocaleString('en-US', { minimumFractionDigits: 2 });
        row.insertCell(3).innerText = data.principalPayment.toLocaleString('en-US', { minimumFractionDigits: 2 });
        row.insertCell(4).innerText = data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }
}