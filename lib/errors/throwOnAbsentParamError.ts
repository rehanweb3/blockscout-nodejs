export default function throwOnAbsentParamError(param: string | undefined | null, paramName = 'param'): void {
  if (param === undefined || param === null || param === '') {
    throw new Error(`Required parameter "${ paramName }" is absent`);
  }
}
