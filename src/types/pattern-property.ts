export enum PatternPropertyType {
	Asset = 'asset',
	Boolean = 'boolean',
	Enum = 'enum',
	EventHandler = 'EventHandler',
	Href = 'href',
	Number = 'number',
	String = 'string'
}

export type SerializedPatternPropertyType =
	| 'asset'
	| 'boolean'
	| 'enum'
	| 'EventHandler'
	| 'href'
	| 'number'
	| 'string';

export enum PatternPropertyOrigin {
	BuiltIn = 'built-in',
	UserProvided = 'user-provided'
}

export type SerializedPatternPropertyOrigin = 'built-in' | 'user-provided';

export type SerializedPatternProperty =
	| SerializedPatternAssetProperty
	| SerializedPatternBooleanProperty
	| SerializedPatternEnumProperty
	| SerializedPatternEventHandlerProperty
	| SerializedPatternNumberProperty
	| SerializedStringProperty
	| SerializedHrefProperty;

export interface SerializedPropertyBase {
	contextId: string;
	description: string;
	example: string;
	hidden: boolean;
	id: string;
	label: string;
	origin: SerializedPatternPropertyOrigin;
	propertyName: string;
	required: boolean;
	type: SerializedPatternPropertyType;
}

export interface SerializedPatternAssetProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'asset';
}

export interface SerializedPatternBooleanProperty extends SerializedPropertyBase {
	defaultValue?: boolean;
	type: 'boolean';
}

export interface SerializedPatternEnumProperty extends SerializedPropertyBase {
	defaultOptionId?: string;
	options: SerializedEnumOption[];
	type: 'enum';
}

export interface SerializedEnumOption {
	contextId: string;
	id: string;
	name: string;
	ordinal: string;
	value: string | number;
}

export enum PatternEventType {
	Event = 'event',
	InputEvent = 'input-event',
	ChangeEvent = 'change-event',
	FocusEvent = 'focus-event',
	MouseEvent = 'mouse-event'
}

export type SerializedPatternEventType =
	| 'Event'
	| 'InputEvent'
	| 'ChangeEvent'
	| 'FocusEvent'
	| 'MouseEvent';

export type PatternEvent = PatternChangeEvent | PatternMouseEvent;

export interface SerializedPatternEvent {
	type: SerializedPatternEventType;
}

export interface PatternChangeEvent {
	type: PatternEventType.ChangeEvent;
}

export interface PatternMouseEvent {
	type: PatternEventType.MouseEvent;
}

export interface SerializedPatternChangeEvent {
	type: 'ChangeEvent';
}

export interface SerializedPatternMouseEvent {
	type: 'MouseEvent';
}

export interface SerializedPatternEventHandlerProperty extends SerializedPropertyBase {
	event: SerializedPatternEvent;
	type: 'EventHandler';
}

export interface SerializedPatternNumberProperty extends SerializedPropertyBase {
	defaultValue?: number;
	type: 'number';
}

export interface SerializedStringProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'string';
}

export interface SerializedHrefProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'href';
}
