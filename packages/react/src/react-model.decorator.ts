import { ClassProvider, Injectable } from "@symph/core";

export function Model(options: Partial<ClassProvider> = {}): ClassDecorator {
  return (target) => {
    return Injectable(Object.assign({ autoLoad: "lazy" }, options))(target);
  };
}
