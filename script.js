// Select both cards and close buttons
const singleCard = document.getElementById('Single-QS-Card');
const multiCard = document.getElementById('Multi-QS-Card');
const closeSingleCard = document.getElementById('close-single-card');
const closeMultiCard = document.getElementById('close-multi-card');

class Customer {
    constructor(id, processingTimeMinutes) {
        this.id = id;
        this.arrivalTime = new Date();  // Store arrival time
        this.arrivalTimeFormatted = this.formatDateTime(this.arrivalTime);  // Formatted arrival time
        this.processingTimeMinutes = processingTimeMinutes;
    }

    formatDateTime(date) {
        return date ? date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }) : '';
    }
}
class QueueSystem {
    constructor(cashierCount) {
        this.queue = [];
        this.customerId = 1;
        this.cashiers = [];
        this.totalCustomers = 0;
        this.totalWaitTime = 0;
        this.customerHistory = [];
        this.initializeCashiers(cashierCount);
    }

    initializeCashiers(count) {
        this.cashiers = [];
        for (let i = 0; i < count; i++) {
            this.cashiers.push({
                id: i + 1,
                available: true,
                currentCustomer: null,
                customersServed: 0,
                remainingTime: 0
            });
        }
        this.updateUI();
        document.getElementById('activeCashiers').textContent = count;
    }
    addCustomer(processingTimeMinutes) {
        const customer = new Customer(this.customerId++, processingTimeMinutes);
        this.queue.push(customer);
        this.totalCustomers++;
        this.updateUI();
        this.processQueue();
    }
    processQueue() {
        for (let cashier of this.cashiers) {
            if (cashier.available && this.queue.length > 0) {
                const customer = this.queue.shift();
                this.assignCustomerToCashier(customer, cashier);
                this.updateUI();
            }
        }
    }
    assignCustomerToCashier(customer, cashier) {
        // Update customer state
        customer.startTime = new Date();
        customer.serverId = cashier.id; // Set the server ID
        customer.status = 'serving';

        // Update cashier state
        cashier.available = false;
        cashier.currentCustomer = customer;
        const processingTimeMs = customer.processingTimeMinutes * 60000;
        cashier.remainingTime = processingTimeMs;

        const startTime = Date.now();
        const updateInterval = 1000;

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            cashier.remainingTime = Math.max(0, processingTimeMs - elapsed);

            if (cashier.remainingTime === 0) {
                clearInterval(timer);

                // Update customer completion data
                customer.endTime = new Date();
                customer.status = 'completed';

                const waitTime = (customer.startTime - customer.arrivalTime) / 1000 / 60;
                this.totalWaitTime += waitTime;

                // Update cashier state
                cashier.available = true;
                cashier.currentCustomer = null;
                cashier.customersServed++;

                // // Update the customer in history
                const historyIndex = this.customerHistory.findIndex(c => c.id === customer.id);
                if (historyIndex !== -1) {
                    this.customerHistory[historyIndex] = { ...customer }; // Ensure serverId is included
                }

                this.processQueue();
            }

            this.updateCashierUI(cashier);
        }, updateInterval);

        // Update the customer in history immediately after assignment
        // this.customerHistory.push({ ...customer }); // Add customer to history immediately
        this.updateCashierUI(cashier);
    }


    recordCashierStatusChange(cashierId, status, customerId) {
        if (!this.cashierHistory[cashierId]) {
            this.cashierHistory[cashierId] = [];
        }

        this.cashierHistory[cashierId].push({
            timestamp: new Date(),
            status: status,
            customerId: customerId
        });
    }
    updateCashierUI(cashier) {
        const cashierElement = document.getElementById(`cashier${cashier.id}`);
        if (!cashierElement) return;

        const statusBadge = cashierElement.querySelector('.status-badge');
        const currentlyServing = cashierElement.querySelector('p:nth-child(2)');
        const customersServed = cashierElement.querySelector('p:nth-child(3)');
        const timeRemaining = cashierElement.querySelector('p:nth-child(4)');

        statusBadge.className = `status-badge ${cashier.available ? 'status-available' : 'status-busy'}`;
        statusBadge.textContent = cashier.available ? 'Available' : 'Busy';

        currentlyServing.textContent = cashier.currentCustomer
            ? `Currently serving: Customer #${cashier.currentCustomer.id} (${cashier.currentCustomer.processingTimeMinutes} min service)`
            : 'Currently serving: None';

        customersServed.textContent = `Customers served: ${cashier.customersServed}`;

        if (!cashier.available && cashier.remainingTime > 0) {
            const remainingSeconds = Math.ceil(cashier.remainingTime / 1000);
            timeRemaining.textContent = `Time remaining: ${remainingSeconds} seconds`;
        } else {
            timeRemaining.textContent = '';
        }
    }

    updateUI() {
        // Update cashiers container
        const cashiersContainer = document.getElementById('cashiersContainer');
        cashiersContainer.innerHTML = '';
        this.cashiers.forEach(cashier => {
            const cashierDiv = document.createElement('div');
            cashierDiv.className = 'cashier';
            cashierDiv.id = `cashier${cashier.id}`;
            cashierDiv.innerHTML = `
                <div class="cashier-header">
                    <h2>Server #${cashier.id}</h2>
                    <span class="status-badge status-available">Avilable</span>
                </div>
                <p>Currently serving: None</p>
                <p>Customers served: ${cashier.customersServed}</p>
                <p></p>
            `;
            cashiersContainer.appendChild(cashierDiv);
        });

        // Update queue list
        const queueList = document.getElementById('queueList');
        queueList.innerHTML = '';
        this.queue.forEach(customer => {
            const li = document.createElement('li');
            li.className = 'queue-item';
            li.innerHTML = `
                <span>Customer #${customer.id}</span>
                <span>(${customer.processingTimeMinutes} min service)</span>
            `;
            queueList.appendChild(li);
        });

        // Update statistics
        document.getElementById('totalCustomers').textContent = this.totalCustomers;
        document.getElementById('queueLength').textContent = this.queue.length;

        const avgWaitTime = this.totalCustomers === 0 ? 0 :
            (this.totalWaitTime / this.totalCustomers).toFixed(1);
        document.getElementById('avgWaitTime').textContent = `${avgWaitTime} min`;
    }

}

QueueSystem.prototype.generateChart = function () {

    if(queueSystem && this.queue.length>0){
        alert("Wait for Customers in queue to enter the servers");
        return;
    }else{
        singleCard.classList.add('flipped');
        singleCard.classList.add('expanded');

        // Prepare data for the chart
        const customerData = this.customerHistory.map(customer => ({
            id: customer.id,
            waitTime: (customer.startTime - customer.arrivalTime) / (1000 * 60), // Wait time in minutes
            serviceTime: customer.processingTimeMinutes, // Service time in minutes
            totalTime: (customer.startTime - customer.arrivalTime) / (1000 * 60) + customer.processingTimeMinutes, // Total time
            serverName: customer.serverId ? `Server ${customer.serverId}` : 'Not Served', // Server name
            serviceStartTime: customer.startTime ? formatDateTime(customer.startTime) : 'Not Started' // Service start time
        }));

        const customerIds = customerData.map(data => `Customer #${data.id}`);
        const totalTimes = customerData.map(data => data.totalTime);

        const canvas = document.getElementById('chartCanvas');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (window.currentChart instanceof Chart) {
            window.currentChart.destroy();
        }

        // Show the canvas
        canvas.style.display = 'block';

        // Create new chart and store it in the global scope
        window.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: customerIds,
                datasets: [
                    {
                        label: 'Customers Information',
                        data: totalTimes,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Customers'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (min)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const customerIndex = context.dataIndex;
                                const customer = customerData[customerIndex];
                                return [
                                    `Service Start: ${customer.serviceStartTime}`,
                                    `Service Time: ${customer.serviceTime} min`,
                                    `Wait Time: ${customer.waitTime.toFixed(1)} min`,
                                    `Server: ${customer.serverName}`,
                                    `Total Time: ${customer.totalTime.toFixed(1)} min`,
                                ];
                            }
                        }
                    }
                }
            }
        });
    }
};
QueueSystem.prototype.generateExcelReport = function () {
    if (!this.customerHistory || this.customerHistory.length === 0) {
        alert('No data available to export.');
        return;
    }

    const data = [];
    const headers = [
        'Customer ID',
        'Interval (min)',
        'Arrivals (Time)',
        'Server Name',
        'Time Service Begin',
        'Service Duration (min)',
        'Service End',
        'Time in Queue (min)'
    ];
    data.push(headers);

    let previousArrivalTime = null;
    let cumulativeArrivalTime = 0;

    this.customerHistory.forEach(customer => {
        const interval = previousArrivalTime ?
            Math.round((customer.arrivalTime - previousArrivalTime) / (1000 * 60)) : 0;
        cumulativeArrivalTime += interval;

        const serverName = customer.serverId ?
            `Server ${customer.serverId}` : 'Not Served';

        const row = [
            customer.id,
            interval,
            formatDateTime(customer.arrivalTime),
            serverName,
            customer.startTime ? formatDateTime(customer.startTime) : 'Not Started',
            customer.processingTimeMinutes || 0,
            customer.endTime ? formatDateTime(customer.endTime) : 'Not Completed',
            customer.startTime ? Math.round((customer.startTime - customer.arrivalTime) / (1000 * 60)) : 0
        ];

        data.push(row);
        previousArrivalTime = customer.arrivalTime;
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Define column widths (in characters)
    const colWidths = [
        { wch: 12 },
        { wch: 15 },
        { wch: 22 },
        { wch: 12 },
        { wch: 22 },
        { wch: 20 },
        { wch: 22 },
        { wch: 18 }
    ];

    // Set column widths
    worksheet['!cols'] = colWidths;

    // Add styling to the header row - Yellow background
    const headerStyle = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: { rgb: "FFFF00" }  // Yellow background
        }
    };

    // Add styling to data cells
    const dataStyle = {
        alignment: { horizontal: 'center' }
    };

    // Apply header styling
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
        worksheet[headerCell].s = headerStyle;
    }

    // Apply data styling to all non-header cells
    for (let R = 1; R <= range.e.r; ++R) {
        for (let C = 0; C <= range.e.c; ++C) {
            const cell = XLSX.utils.encode_cell({ r: R, c: C });
            if (worksheet[cell]) {
                worksheet[cell].s = dataStyle;
            }
        }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Queue Simulation Data');

    // Generate filename with current date and time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

    XLSX.writeFile(workbook, `QueueSimulation_${dateStr}_${timeStr}.xlsx`);
};

// Event listener for button
document.getElementById('generateChartBtn').addEventListener('click', function () {

        if (multiCard.classList.contains('expanded')) {
            queueSystem.generateChart();
        }
});


function formatDateTime(date) {
    return date ? date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }) : '';
}



let queueSystem = null;

function generateExcel() {

    if (queueSystem) {
        queueSystem.generateExcelReport();
    }
}

function initializeSystem() {
    const cashierCount = parseInt(document.getElementById('cashierCount').value);
    const errorMessage = document.getElementById('errorMessage');

    if (isNaN(cashierCount) || cashierCount < 1 || cashierCount > 10) {
        errorMessage.textContent = 'Please enter a valid number of cashiers (1-10)';
        return;
    }

    errorMessage.textContent = '';
    queueSystem = new QueueSystem(cashierCount);

    // Enable buttons
    document.getElementById('addCustomerBtn').disabled = false;
    document.getElementById('generateExcelBtn').disabled = false;
    document.getElementById('cashierCount').disabled = true;
    document.getElementById('generateChartBtn').disabled = false;
}

function addCustomer() {
    if (queueSystem) {
        showServiceTimeModal();
    }
}

QueueSystem.prototype.addCustomer = function (processingTimeMinutes) {
    const customer = {
        id: this.customerId++,
        items: Math.floor(Math.random() * 20) + 1,
        arrivalTime: new Date(),  // Ensure this timestamp is recorded
        processingTimeMinutes: processingTimeMinutes,
        startTime: null,
        endTime: null,
        serverId: null,
        status: 'waiting'
    };

    this.queue.push(customer);
    this.totalCustomers++;

    if (!this.customerHistory.find(c => c.id === customer.id)) {
        this.customerHistory.push(customer);
    }

    this.updateUI();
    this.processQueue();
};



// Add flip and expand behavior on card click, but prevent closing by clicking the card itself
singleCard.addEventListener('click', function (e) {
    // Only toggle the flip and expanded state if it's not already flipped and expanded
    if (!singleCard.classList.contains('expanded')) {
        singleCard.classList.add('flipped');
        singleCard.classList.add('expanded');
    }
});

// Close the expanded Single QS card when the close button is clicked
closeSingleCard.addEventListener('click', function (e) {
    e.stopPropagation(); // Prevent the event from triggering the card click
    singleCard.classList.remove('expanded');
    singleCard.classList.remove('flipped');
});

// Add flip and expand behavior on multi-card click
multiCard.addEventListener('click', function (e) {
    if (!multiCard.classList.contains('expanded')) {
        multiCard.classList.add('flipped');
        multiCard.classList.add('expanded');
    }
});

// Close the expanded Multi QS card when the close button is clicked
closeMultiCard.addEventListener('click', function (e) {
    e.stopPropagation(); // Prevent the event from triggering the card click
    multiCard.classList.remove('expanded');
    multiCard.classList.remove('flipped');
});


let Import_file = document.getElementById("Import-file");
let import_container = document.getElementById("import-container");
let fileInput = document.getElementById("fileInput");
let table_tr = document.getElementById("table-tr");
let title = document.getElementById("title");
let table_chart_container = document.getElementById("table-chart-container");

Import_file.addEventListener(("click"), () => {
    import_container.style.display = "flex";
    import_container.style.justifyContent = "center";
    import_container.style.alignItems = "center";
    import_container.style.margin = "50px 0";
})

fileInput.addEventListener("change", (event) => {
    table_tr.style.display = "block";
    title.style.fontSize = "25px";
    table_chart_container.style.display = "flex";
});
QueueSystem.prototype.processQueue = function () {
    for (let cashier of this.cashiers) {
        if (cashier.available && this.queue.length > 0) {
            const customer = this.queue.shift();

            // Assign the customer to the cashier
            this.assignCustomerToCashier(customer, cashier);

            // Notify UI to remove the customer from the queue list
            this.updateUI();
        }
    }
};

QueueSystem.prototype.updateUI = function () {
    const queueList = document.getElementById('queueList');
    queueList.innerHTML = '';

    this.queue.forEach(customer => {
        const li = document.createElement('li');
        li.className = 'queue-item';
        li.innerHTML = `
            <span>Customer #${customer.id}</span>
            <span>(${customer.items} items)</span>
            <span>Arrival Time: ${customer.arrivalTimeFormatted}</span>
        `;
        queueList.appendChild(li);
    });

    document.getElementById('totalCustomers').textContent = this.totalCustomers;
    const avgWaitTime = this.totalCustomers === 0 ? 0 : (this.totalWaitTime / this.totalCustomers).toFixed(1);
    document.getElementById('avgWaitTime').textContent = `${avgWaitTime} min`;
    document.getElementById('queueLength').textContent = this.queue.length;
};

// Add method to format time values consistently
QueueSystem.prototype.formatTimeValue = function (date) {
    if (!date) return null;
    return new Date(date);
};

// ----------------------------------------
document.querySelector('.container').insertAdjacentHTML('beforeend', modalHtml);
// Add the CSS to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = modalCSS;
document.head.appendChild(styleSheet);
// Modal control functions
function showServiceTimeModal() {
    document.getElementById('serviceTimeModal').style.display = 'block';
}

function closeServiceTimeModal() {
    document.getElementById('serviceTimeModal').style.display = 'none';
}

function confirmAddCustomer() {
    const serviceTime = parseInt(document.getElementById('serviceTime').value);
    if (isNaN(serviceTime) || serviceTime < 1 || serviceTime > 60) {
        alert('Please enter a valid service time between 1 and 60 minutes');
        return;
    }

    if (queueSystem) {
        queueSystem.addCustomer(serviceTime);
    }
    closeServiceTimeModal();
}
window.onclick = function (event) {
    const modal = document.getElementById('serviceTimeModal');
    if (event.target === modal) {
        closeServiceTimeModal();
    }
}


document.getElementById('addCustomerBtn').addEventListener('click', debounce(function () {
    const serviceTime = parseInt(document.getElementById('serviceTime').value);
    if (isNaN(serviceTime) || serviceTime < 1 || serviceTime > 60) {
        alert('Please enter a valid service time between 1 and 60 minutes');
        return;
    }

    if (queueSystem) {
        queueSystem.addCustomer(serviceTime);
    }
}, 300));
