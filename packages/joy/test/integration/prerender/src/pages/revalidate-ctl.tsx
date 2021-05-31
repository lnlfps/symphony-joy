import React, { ReactNode } from "react";
import {
  Controller,
  Model,
  ReactController,
  ReactModel,
  Route,
} from "@symph/react";
import { Inject } from "@symph/core";
import { Prerender } from "@symph/joy/dist/build/prerender";

@Model()
export class RevalidateModel extends ReactModel<{
  msg: string;
  updateTime: number;
}> {
  getInitState(): {
    msg: string;
    updateTime: number;
  } {
    return {
      msg: "init",
      updateTime: 0,
    };
  }

  async setStaticMessage(newMessage: string): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.setState({
          msg: newMessage,
          updateTime: new Date().getTime(),
        });
        resolve();
      }, 10);
    });
  }
}

@Prerender()
@Route({ path: "/revalidate" })
@Controller()
export default class RevalidateCtl extends ReactController {
  @Inject()
  public revalidateModel: RevalidateModel;

  async initialModelStaticState(urlParams: any): Promise<number> {
    await this.revalidateModel.setStaticMessage(
      "hello from initialModelStaticState"
    );
    return 1;
  }

  renderView(): ReactNode {
    const { msg, updateTime } = this.revalidateModel.state;
    return (
      <>
        <div id="msg">{msg}</div>
        <div id="updateTime">{updateTime}</div>
      </>
    );
  }
}