import { Component, OnInit, InjectionToken, Input } from '@angular/core';
import Web3 from 'web3';
import { Observable, interval, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import * as Chartist from 'chartist';
import { ILatestBlock } from './dashboard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  public web3 = new Web3(Web3.givenProvider);
  public latestBlock: ILatestBlock;
  public latestBlockDifficulty: number;
  public latestBlockTxnsLength: number;
  public latestBlockTxns: any[];
  public latestBlockTxnsDetails: any = [];
  public latestBlockNumber: number;
  public latestBlockArray: any = [];
  public latestHashRate: number;
  subscription: Subscription;

  // events
  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }

  @Input() blocks: Observable<any>;

  constructor() { }

  async ngOnInit() {
    // //Get latest block information
    // this.latestBlock = await this.web3.eth.getBlock(await this.web3.eth.getBlockNumber())
    // this.latestBlockNumber = this.latestBlock.number;
    // this.latestBlockDifficulty = this.latestBlock.difficulty;
    // this.latestBlockTxnsLength = this.latestBlock.transactions.length;
    // this.latestBlockTxns = this.latestBlock.transactions;

    //this.getLatestBlock();
    this.getLatestBlock();
    this.getLatestBlockInfo();
    this.getLatestBlockTransactions();

    this.latestHashRate = await this.web3.eth.getHashrate()
    .then(console.log);
   

    //Get latest test transactions from a block
    for (var j=0; j < 10; j++){
      this.latestBlockTxnsDetails.push(await this.web3.eth.getTransaction(this.latestBlockTxns[j]))
    }

  }

  //Return range of the latest 10 blocks
  range(start, end, step){
    var range = [];
    var typeofStart = typeof start;
    var typeofEnd = typeof end;

    if (step === 0) {
        throw TypeError("Step cannot be zero.");
    }

    if (typeofStart == "undefined" || typeofEnd == "undefined") {
        throw TypeError("Must pass start and end arguments.");
    } else if (typeofStart != typeofEnd) {
        throw TypeError("Start and end arguments must be of same type.");
    }

    typeof step == "undefined" && (step = 1);

    if (end < start) {
        step = -step;
    }

    if (typeofStart == "number") {

        while (step > 0 ? end >= start : end <= start) {
            range.push(start);
            start += step;
        }

    } else if (typeofStart == "string") {

        if (start.length != 1 || end.length != 1) {
            throw TypeError("Only strings with one character are supported.");
        }

        start = start.charCodeAt(0);
        end = end.charCodeAt(0);

        while (step > 0 ? end >= start : end <= start) {
            range.push(String.fromCharCode(start));
            start += step;
        }

    } else {
        throw TypeError("Only string and number types are supported");
    }

    return range;

  }

  //Get the latest 10 blocks
  getLatestBlock() {
    setInterval(async () => {
      //Batch execute latest 10 blocks
      const latest = await this.web3.eth.getBlockNumber()
      const blockNumbers = this.range(latest, latest - 9, 1)
      const batch = new this.web3.eth.BatchRequest()

      blockNumbers.forEach((blockNumber) => {
        batch.add(
          this.web3.eth.getBlock(blockNumber)
        )
      })
      this.latestBlockArray = batch.requests;
      await batch.execute();
    }, 5000)
  }

  //Get info from the latest block
  getLatestBlockInfo() {
    setInterval(async () => {
      //Get latest block information
      this.latestBlock = await this.web3.eth.getBlock(await this.web3.eth.getBlockNumber())
      this.latestBlockNumber = this.latestBlock.number;
      this.latestBlockDifficulty = this.latestBlock.difficulty;
      this.latestBlockTxnsLength = this.latestBlock.transactions.length;
      this.latestBlockTxns = this.latestBlock.transactions;
    }, 1000)
  }

  //Get transactions from the latest block
  getLatestBlockTransactions() {
    setInterval(async () => {
      //Batch execute latest 10 blocks
      const latestNumber = await this.web3.eth.getBlockNumber()
      this.latestBlock = await this.web3.eth.getBlock(latestNumber)
      const batch = new this.web3.eth.BatchRequest()

      for (var j=0; j < 10; j++){
        batch.add(
          await this.web3.eth.getTransaction(this.latestBlock.transactions[j])
        )
      }
      this.latestBlockTxnsDetails = batch.requests;
      await batch.execute();
    }, 5000)
  }

  sayHello(text){
    alert(text);
  }

}
