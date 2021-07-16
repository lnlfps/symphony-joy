import { ClassProvider, Injectable, Provider, Tap, Type } from "@symph/core";
import { FileScanner, IScanOutModule } from "./scanner/file-scanner";
import { handlebars } from "../../lib/handlebars";
import { readFileSync } from "fs";
import { join } from "path";
import { FileGenerator } from "../../plugin/file-generator";

@Injectable()
export class JoyAppProvidersExplorerService {
  protected moduleTemplate = handlebars.compile(
    readFileSync(
      join(__dirname, "./joy-app-providers-explorer.handlebars"),
      "utf-8"
    )
  );

  protected providerModules: IScanOutModule[] = [];

  constructor(protected fileGenerator: FileGenerator) {}

  public getModules(): IScanOutModule[] {
    return this.providerModules;
  }

  public setModules(providers: IScanOutModule[]): void {
    this.providerModules = providers;
  }

  public hasExist(modulePath: string): boolean {
    return !!this.providerModules.find((v) => v.path === modulePath);
  }

  public addModule(provider: IScanOutModule) {
    if (this.hasExist(provider.path as string)) {
      throw new Error(`provider (${JSON.stringify(provider)}) is exist`);
    }
    this.providerModules.push(provider);
  }

  public removeModule(modulePath: string): IScanOutModule | undefined {
    for (let i = 0; i < this.providerModules.length; i++) {
      const providerModule = this.providerModules[i];
      if (providerModule.path === modulePath) {
        this.providerModules.splice(i, 1);
        return providerModule;
      }
    }
  }

  protected addScanOutModule(module: IScanOutModule): boolean {
    if (!module.providerDefines || module.providerDefines.size === 0) {
      return false;
    }
    let hasAutoLoadProvider = false;
    let hasNotAutoLoadProvider = false;
    module.providerDefines.forEach((providerDefine, exportKey) => {
      /**
       * the item in position 0:
       * 1. when type is ClassProvider,it is the ClassProvider definition .
       * 2. when type is Configuration, it is the Configuration class's Injectable definition.
       */
      const provider = providerDefine.providers[0];
      (provider as ClassProvider).autoLoad === true
        ? (hasAutoLoadProvider = true)
        : (hasNotAutoLoadProvider = true);
    });
    if (!hasAutoLoadProvider) {
      return false;
    }
    if (hasNotAutoLoadProvider) {
      throw new Error(
        "Can not export auto load class and not auto load class in single js/ts file."
      );
    }

    this.providerModules.push(module);
    return true;
  }

  @Tap()
  public async afterScanOutModuleHook(module: IScanOutModule) {
    if (module.isAdd) {
      this.addScanOutModule(module);
    } else if (module.isModify) {
      this.removeModule(module.path);
      this.addScanOutModule(module);
    } else if (module.isRemove) {
      this.removeModule(module.path);
    }
  }

  @Tap()
  protected async onGenerateFiles() {
    const modules = this.providerModules.map((mod) => {
      return {
        path: mod.resource,
        providerKeys: mod.providerDefines?.keys(),
      };
    });

    // const importModules = this.providerModules.reduce((pre , mod) => {
    //   // return {
    //   //   path: mod.resource,
    //   //   providerKeys: mod.providerDefines?.keys()
    //   // }
    //   if(!mod.resource) {
    //     return pre
    //   }
    //   pre[mod.resource] = `require("${mod.resource}")`
    //   return pre;
    // }, {} as Record<string, unknown>)

    const moduleFileContent = this.moduleTemplate({ modules });
    // await this.fileGenerator.writeClientFile("./routes.js", clientFileContent);
    await this.fileGenerator.writeJoyFile(
      "./app-modules.config.js",
      moduleFileContent
    );
  }
}