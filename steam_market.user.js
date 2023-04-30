// ==UserScript==
// @name         Steam Market+
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  nickely was here
// @author       nickely
// @match        https://steamcommunity.com/market/listings/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require      http://timeago.yarp.com/jquery.timeago.js
// ==/UserScript==

(function () {
    'use strict';
    var $s = jQuery.noConflict();

    const floatFormat = (str) => {
        return parseFloat(str.replace(",", "."));
    }

    var scriptData = document.querySelectorAll('#responsive_page_template_content > script')[1].firstChild.data;
    var rawPlotData = scriptData.split("var line1=")[1].split(";")[0];

    const buyOrderEl = document.querySelector("[id^='mybuyorder'].market_listing_row");

    if (buyOrderEl) {
        const buyOrderName = buyOrderEl.querySelector('.market_listing_item_name').innerText;
        var myBuyOrderPrice = floatFormat(buyOrderEl.querySelector('.market_listing_right_cell.market_listing_my_price:not(.market_listing_buyorder_qty)').innerText);

        const existingItems = JSON.parse(localStorage.getItem("watchListItems")) || [];
        var currentItem = existingItems.find(item => item.name == buyOrderName) || null;
    }


    function waitForEl(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector).children.length == 4) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector).children.length == 4) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }


    function createQuantityColumn() {
        var quantityCountdownHeaderEl = `<span class="market_listing_right_cell market_listing_my_price market_listing_buyorder_qty">Approximation</span>`
        var quantityCountdownEl =
            `<div class="market_listing_right_cell market_listing_my_price market_listing_buyorder_qty">
		         <span class="market_table_value">
		             <span class="market_listing_price market_listing_quantity">
				        ${currentItem.quantityLeft}			</span>
		         </span>
	         </div>`;

        var table = document.querySelector('.my_listing_section.market_content_block.market_home_listing_table');
        var tableHeader = table.querySelector('.market_listing_table_header');
        var tableBody = table.querySelector("[id^='mybuyorder'].market_listing_row");

        tableHeader.querySelectorAll('span')[1].insertAdjacentHTML("beforebegin", quantityCountdownHeaderEl);
        tableBody.querySelectorAll('div')[1].insertAdjacentHTML("beforebegin", quantityCountdownEl);
    }


    function updateQuantityColumn(quantitySold) {
        var currentQuantityEl = document.querySelector('.market_listing_quantity');
        currentQuantityEl.innerText = parseInt(currentQuantityEl.innerText) - quantitySold;
    }


    function createWatchListBtn() {
        var btnEl = `<a class="btn_green_white_innerfade btn_medium market_noncommodity_buyorder_button add_to_watch" href="javascript:void(0)"> Add to watchlist</a>`;
        var btnParentEl = document.querySelector('#tabContentsMyListings');

        btnParentEl.insertAdjacentHTML("beforeend", btnEl);
    }


    function createSalesCount() {
        var dailySales = [];
        var weeklySales = [];
        var monthlySales = [];
        var yearlySales = [];
        var totalSales = [];

        var today = new Date();
        var daily = new Date(today).setDate(today.getDate() - 1);
        var weekly = new Date(today).setDate(today.getDate() - 7);
        var monthly = new Date(today).setMonth(today.getMonth() - 1);
        var yearly = new Date(today).setFullYear(today.getFullYear() - 1);

        var myRawPlotData = JSON.parse(rawPlotData);
        myRawPlotData.forEach((el) => {
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

        var dailySalesCount = dailySales.reduce((prev, curr) => prev + curr, 0);
        var weeklySalesCount = weeklySales.reduce((prev, curr) => prev + curr, 0);
        var monthlySalesCount = monthlySales.reduce((prev, curr) => prev + curr, 0);
        var yearlySalesCount = yearlySales.reduce((prev, curr) => prev + curr, 0);
        var totalSalesCount = totalSales.reduce((prev, curr) => prev + curr, 0);

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
                          <tr style="color: green">
                            <td>${dailySalesCount.toLocaleString()} sold</td>
                            <td>${weeklySalesCount.toLocaleString()} sold</td>
                            <td>${monthlySalesCount.toLocaleString()} sold</td>
                            <td>${yearlySalesCount.toLocaleString()} sold</td>
                            <td>${totalSalesCount.toLocaleString()} sold</td>
                          </tr>
                        </table>
                     </div>`;
        targetEl.insertAdjacentHTML('beforebegin', htmlEl);
    }


    function addZoomByDayOption() {
        var zoomByDayEl = `<a class="zoomopt" onclick="return pricehistory_zoomDays( g_plotPriceHistory, g_timePriceHistoryEarliest, g_timePriceHistoryLatest, 1 );" href="javascript:void(0)">Day</a>`;
        waitForEl('.pricehistory_zoom_controls').then(el => el.children[0].insertAdjacentHTML("beforebegin", zoomByDayEl));
    }


    function getMatchingBuyOrderPrice() {
        var existingBuyOrdersEl = document.querySelector('#market_commodity_buyreqeusts_table .market_commodity_orders_table > tbody');
        var existingBuyOrderPrices = existingBuyOrdersEl.querySelectorAll('tr > td:nth-child(1)');

        var matchingOrder = Array.from(existingBuyOrderPrices).find(existingBuyOrderPrice => floatFormat(existingBuyOrderPrice.innerText) == myBuyOrderPrice) || null;

        if (matchingOrder) {
            return matchingOrder;
        }
        return 0;
    }


    function getSalesFromNowToDate() {
        var DATE = 0;
        var PRICE = 1;
        var SALES = 2;

        var itemDate = currentItem.date; //3.6e+6 = one hour

        var salesSinceDate = [];

        var myRawPlotData = JSON.parse(rawPlotData);
        myRawPlotData.forEach((el) => {
            if (itemDate < Date.parse(el[DATE]) && parseFloat(el[1].toFixed(2)) == myBuyOrderPrice) {
                salesSinceDate.push(parseInt((el[SALES])));
            }
        });

        return salesSinceDate.reduce((prev, curr) => prev + curr, 0);
    }


    function main() {
        createSalesCount();
        //createWatchListBtn();

        if (currentItem) {
            createQuantityColumn();
            var sales = getSalesFromNowToDate();
            updateQuantityColumn(sales);
        }
        addZoomByDayOption();

    }
    main();


    $s(document.head).append($s("<style class='steam-market-style'></style>").html(
        `.market_listing_quantity {font-weight: bold;}`
    ));

    $s(".add_to_watch").click(() => {
        console.log("click!");

        //var buyOrderQuantity = parseInt(buyOrderEl.querySelector('.market_listing_right_cell.market_listing_my_price.market_listing_buyorder_qty').innerText);

        var rawDateOfWatchList = new Date();
        var dateOfWatchList = Date.parse(rawDateOfWatchList) // ms

        var matchingOrder = getMatchingBuyOrderPrice();
        var existingBuyOrder;

        if (matchingOrder) {
            var tempPrice = floatFormat(matchingOrder.innerText) || 0;
            var tempQuantity = parseInt(matchingOrder.nextSibling.innerText);

            existingBuyOrder = { 'quantityLeft': tempQuantity };
        }
        else {
            existingBuyOrder = { 'quantityLeft': 0 };
        }

        var existingItems = JSON.parse(localStorage.getItem('watchListItems')) || [];

        if (currentItem) {
            currentItem.quantityLeft = existingBuyOrder.quantityLeft;
            console.log(`Could not add item: ${buyOrderName}, as it already existed in localStorage!`);
        }
        else {
            var itemObj = {
                'date': dateOfWatchList,
                'name': buyOrderName,
                //'quantity': buyOrderQuantity,
                'price': myBuyOrderPrice,
                ...existingBuyOrder,
            };

            existingItems.push(itemObj);
            localStorage.setItem("watchListItems", JSON.stringify(existingItems));
            currentItem = existingItems.find(item => item.name == buyOrderName) || null;

            createQuantityColumn();
            console.log(`Added item: ${buyOrderName} at Price: ${myBuyOrderPrice} to Watchlist!`);
        }
    });
})();