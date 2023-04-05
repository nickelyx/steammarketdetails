// ==UserScript==
// @name         Steam Market Item Sales
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  nickely was here
// @author       nickely
// @match        https://steamcommunity.com/market/listings/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var scriptData = document.querySelector('#responsive_page_template_content > script:nth-child(6)').firstChild.data;
    var rawPlotData = scriptData.split("var line1=")[1].split(";")[0];

    var dailySales = [];
    var weeklySales = [];
    var monthlySales = [];
    var yearlySales = [];
    var totalSales = [];

	var dailySalesCount = 0
    var weeklySalesCount = 0
    var monthlySalesCount = 0
    var yearlySalesCount = 0
    var totalSalesCount = 0

    var today = new Date();
    var daily = new Date(today).setDate(today.getDate() - 1);
    var weekly = new Date(today).setDate(today.getDate() - 7);
    var monthly = new Date(today).setMonth(today.getMonth() - 1);
    var yearly = new Date(today).setFullYear(today.getFullYear() - 1);

    rawPlotData = JSON.parse(rawPlotData);
    rawPlotData.forEach((el) => {
        if (daily < Date.parse(el[0])) {
            dailySales.push(parseInt((el[2])));
        }
        if (weekly < Date.parse(el[0])) {
            weeklySales.push(parseInt((el[2])));
        }
        if (monthly < Date.parse(el[0])) {
            monthlySales.push(parseInt((el[2])));
        }
        if (yearly < Date.parse(el[0])) {
            yearlySales.push(parseInt((el[2])));
        }
        totalSales.push(parseInt((el[2])));
    });
    if (dailySales.length > 0) {
        dailySalesCount = dailySales.reduce((prev, curr) => prev + curr);
    }
    if (weeklySales.length > 0) {
    	weeklySalesCount = weeklySales.reduce((prev, curr) => prev + curr);
    }
	if (monthlySales.length > 0) {
        monthlySalesCount = monthlySales.reduce((prev, curr) => prev + curr);
    }
    if (yearlySales.length > 0) {
    	yearlySalesCount = yearlySales.reduce((prev, curr) => prev + curr);
    }
    totalSalesCount = totalSales.reduce((prev, curr) => prev + curr);

    var targetEl = document.querySelector('#pricehistory');

    var htmlEl = `<div class="market_listing_table_message">
                        <table id="market_volume_table" style="width: 100%; color: white; font-weight: bold">
                           <tr>
                            <th>Daily</th>
                            <th>Weekly</th>
                            <th>Monthly</th>
                            <th>Yearly</th>
                            <th>All time</th>
                          </tr>
                          <tr>
                            <td>${dailySalesCount.toLocaleString()} sold</td>
                            <td>${weeklySalesCount.toLocaleString()} sold</td>
                            <td>${monthlySalesCount.toLocaleString()} sold</td>
                            <td>${yearlySalesCount.toLocaleString()} sold</td>
                            <td>${totalSalesCount.toLocaleString()} sold</td>
                          </tr>
                         </table>
                      </div>`;

    targetEl.insertAdjacentHTML('beforebegin', htmlEl);

})();
