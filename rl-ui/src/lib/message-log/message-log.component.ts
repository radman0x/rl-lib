import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'rad-message-log',
  templateUrl: './message-log.component.html',
  styleUrls: ['./message-log.component.css'],
})
export class MessageLogComponent implements OnInit {
  messageBuffer: [string] = [''];
  constructor() {}

  ngOnInit(): void {}

  logMessageStyle(index: number) {
    return index === 0
      ? {
          font: 'bold 18px monospace',
        }
      : {
          font: '16px monospace',
        };
  }

  addMessageToLog(message: string) {
    this.messageBuffer = [message];
  }
}
