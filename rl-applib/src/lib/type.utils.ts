export type Id<T> = {} & { [P in keyof T]: T[P] };
