// import {
//   CanActivate,
//   ExceptionFilter,
//   NestInterceptor,
//   PipeTransform,
//   WebSocketAdapter,
// } from '@nestjs/common';
// import { InstanceWrapper } from './injector/instance-wrapper';
import { CanActivate } from "./interfaces/features/can-activate.interface";
import { NestInterceptor } from "./interfaces/features/nest-interceptor.interface";
import { ExceptionFilter } from "./interfaces/exceptions";
import { PipeTransform } from "./interfaces/features/pipe-transform.interface";
import { InstanceWrapper } from "@symph/core";
import { WebSocketAdapter } from "./interfaces/websockets/web-socket-adapter.interface";

export class ApplicationConfig {
  private dir: string;

  private globalPrefix = "";
  private globalPipes: PipeTransform[] = [];
  private globalFilters: ExceptionFilter[] = [];
  private globalInterceptors: NestInterceptor[] = [];
  private globalGuards: CanActivate[] = [];
  private readonly globalRequestPipes: InstanceWrapper<PipeTransform>[] = [];
  private readonly globalRequestFilters: InstanceWrapper<
    ExceptionFilter
  >[] = [];
  private readonly globalRequestInterceptors: InstanceWrapper<
    NestInterceptor
  >[] = [];
  private readonly globalRequestGuards: InstanceWrapper<CanActivate>[] = [];

  constructor(private ioAdapter: WebSocketAdapter | null = null) {}

  public setGlobalPrefix(prefix: string) {
    this.globalPrefix = prefix;
  }

  public getGlobalPrefix() {
    return this.globalPrefix;
  }

  public setIoAdapter(ioAdapter: WebSocketAdapter) {
    this.ioAdapter = ioAdapter;
  }

  public getIoAdapter(): WebSocketAdapter {
    // @ts-ignore
    return this.ioAdapter;
  }

  public addGlobalPipe(pipe: PipeTransform<any>) {
    this.globalPipes.push(pipe);
  }

  public useGlobalPipes(...pipes: PipeTransform<any>[]) {
    this.globalPipes = this.globalPipes.concat(pipes);
  }

  public getGlobalFilters(): ExceptionFilter[] {
    return this.globalFilters;
  }

  public addGlobalFilter(filter: ExceptionFilter) {
    this.globalFilters.push(filter);
  }

  public useGlobalFilters(...filters: ExceptionFilter[]) {
    this.globalFilters = this.globalFilters.concat(filters);
  }

  public getGlobalPipes(): PipeTransform<any>[] {
    return this.globalPipes;
  }

  public getGlobalInterceptors(): NestInterceptor[] {
    return this.globalInterceptors;
  }

  public addGlobalInterceptor(interceptor: NestInterceptor) {
    this.globalInterceptors.push(interceptor);
  }

  public useGlobalInterceptors(...interceptors: NestInterceptor[]) {
    this.globalInterceptors = this.globalInterceptors.concat(interceptors);
  }

  public getGlobalGuards(): CanActivate[] {
    return this.globalGuards;
  }

  public addGlobalGuard(guard: CanActivate) {
    this.globalGuards.push(guard);
  }

  public useGlobalGuards(...guards: CanActivate[]) {
    this.globalGuards = this.globalGuards.concat(guards);
  }

  public addGlobalRequestInterceptor(
    wrapper: InstanceWrapper<NestInterceptor>
  ) {
    this.globalRequestInterceptors.push(wrapper);
  }

  public getGlobalRequestInterceptors(): InstanceWrapper<NestInterceptor>[] {
    return this.globalRequestInterceptors;
  }

  public addGlobalRequestPipe(wrapper: InstanceWrapper<PipeTransform>) {
    this.globalRequestPipes.push(wrapper);
  }

  public getGlobalRequestPipes(): InstanceWrapper<PipeTransform>[] {
    return this.globalRequestPipes;
  }

  public addGlobalRequestFilter(wrapper: InstanceWrapper<ExceptionFilter>) {
    this.globalRequestFilters.push(wrapper);
  }

  public getGlobalRequestFilters(): InstanceWrapper<ExceptionFilter>[] {
    return this.globalRequestFilters;
  }

  public addGlobalRequestGuard(wrapper: InstanceWrapper<CanActivate>) {
    this.globalRequestGuards.push(wrapper);
  }

  public getGlobalRequestGuards(): InstanceWrapper<CanActivate>[] {
    return this.globalRequestGuards;
  }
}