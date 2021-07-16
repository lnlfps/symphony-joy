// import { BadRequestException, NotFoundException } from '@nestjs/common';
// import { HOST_METADATA, MODULE_PATH } from '@nestjs/common/constants';
// import { HttpServer, Type } from '@nestjs/common/interfaces';
// import { Controller } from '@nestjs/common/interfaces/controllers/controller.interface';
// import { Logger } from '@nestjs/common/services/logger.service';
// import { ApplicationConfig } from '../application-config';
// import { CONTROLLER_MAPPING_MESSAGE } from '../helpers/messages';
// import { NestContainer } from '../injector/container';
// import { Injector } from '../injector/injector';
// import { InstanceWrapper } from '../injector/instance-wrapper';
import { MetadataScanner } from "../metadata-scanner";
import { Resolver } from "./interfaces/resolver.interface";
import { RouterExceptionFilters } from "./router-exception-filters";
import { RouterExplorer } from "./router-explorer";
import { RouterProxy } from "./router-proxy";
import { ServerContainer } from "../server-container";
import { ApplicationConfig } from "../application-config";
import { Injector, InstanceWrapper, Logger, Type } from "@symph/core";
import { CONTROLLER_METADATA, HOST_METADATA, MODULE_PATH } from "../constants";
import { HttpServer } from "../interfaces/http";
import { BadRequestException, NotFoundException } from "../exceptions-common";
import { Controller } from "../interfaces/controllers";
import { CONTROLLER_MAPPING_MESSAGE } from "../helpers/messages";

export class RoutesResolver implements Resolver {
  private readonly logger = new Logger(RoutesResolver.name, true);
  private readonly routerProxy = new RouterProxy();
  private readonly routerExceptionsFilter: RouterExceptionFilters;
  private readonly routerExplorer: RouterExplorer;

  constructor(
    private readonly container: ServerContainer,
    private readonly config: ApplicationConfig,
    private readonly injector: Injector
  ) {
    this.routerExceptionsFilter = new RouterExceptionFilters(
      container,
      config,
      container.getHttpAdapterRef()
    );
    const metadataScanner = new MetadataScanner();
    this.routerExplorer = new RouterExplorer(
      metadataScanner,
      this.container,
      this.injector,
      this.routerProxy,
      this.routerExceptionsFilter,
      this.config
    );
  }

  public resolve<T extends HttpServer>(
    applicationRef: T,
    basePath: string,
    providerIds?: string[]
  ) {
    // const modules = this.container.getModules();
    // modules.forEach(({ controllers, metatype }, moduleName) => {
    //   let path = metatype ? this.getModulePathMetadata(metatype) : undefined;
    //   path = path ? basePath + path : basePath;
    //   this.registerRouters(controllers, moduleName, path, applicationRef);
    // });

    const controllers = this.container.filter<Controller>((id, wrapper) => {
      if (
        (!providerIds || providerIds.indexOf(id) >= 0) &&
        wrapper &&
        wrapper.instanceBy === "class"
      ) {
        return Reflect.getMetadata(CONTROLLER_METADATA, wrapper.useClass!);
      }
      return false;
    });
    const path = basePath;
    this.registerRouters(controllers, path, applicationRef);
  }

  public registerRouters(
    routes: Map<string, InstanceWrapper<Controller>>,
    // moduleName: string,
    basePath: string,
    applicationRef: HttpServer
  ) {
    routes.forEach((instanceWrapper) => {
      const { type: metatype } = instanceWrapper;

      const host = this.getHostMetadata(metatype) || "";
      const paths = this.routerExplorer.extractRouterPath(
        metatype as Type<any>,
        basePath
      );
      const controllerName = metatype.name;

      paths.forEach((path) => {
        this.logger.log(
          CONTROLLER_MAPPING_MESSAGE(
            controllerName,
            this.routerExplorer.stripEndSlash(path)
          )
        );
        this.routerExplorer.explore(
          instanceWrapper,
          // moduleName,
          applicationRef,
          path,
          host
        );
      });
    });
  }

  public registerNotFoundHandler() {
    const applicationRef = this.container.getHttpAdapterRef();
    const callback = <TRequest, TResponse>(req: TRequest, res: TResponse) => {
      const method = applicationRef.getRequestMethod
        ? applicationRef.getRequestMethod(req)
        : "unknown";
      const url = applicationRef.getRequestUrl
        ? applicationRef.getRequestUrl(req)
        : "unknown";
      throw new NotFoundException(`Cannot ${method} ${url}`);
    };
    // @ts-ignore
    const handler = this.routerExceptionsFilter.create({}, callback, undefined);
    const proxy = this.routerProxy.createProxy(callback, handler);
    applicationRef.setNotFoundHandler &&
      applicationRef.setNotFoundHandler(proxy, this.config.getGlobalPrefix());
  }

  public registerExceptionHandler() {
    const callback = <TError, TRequest, TResponse>(
      err: TError,
      req: TRequest,
      res: TResponse,
      next: Function
    ) => {
      throw this.mapExternalException(err);
    };
    // @ts-ignore
    const handler = this.routerExceptionsFilter.create(
      {},
      callback as any,
      undefined
    );
    const proxy = this.routerProxy.createExceptionLayerProxy(callback, handler);
    const applicationRef = this.container.getHttpAdapterRef();
    applicationRef.setErrorHandler &&
      applicationRef.setErrorHandler(proxy, this.config.getGlobalPrefix());
  }

  public mapExternalException(err: any) {
    switch (true) {
      case err instanceof SyntaxError:
        return new BadRequestException(err.message);
      default:
        return err;
    }
  }

  private getModulePathMetadata(metatype: Type<unknown>): string | undefined {
    return Reflect.getMetadata(MODULE_PATH, metatype);
  }

  private getHostMetadata(
    metatype: Type<unknown> | Function
  ): string | string[] | undefined {
    return Reflect.getMetadata(HOST_METADATA, metatype);
  }
}