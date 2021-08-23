import { AbiInput } from 'web3-utils';
import { Form, Input, Select } from 'antd';
import { SecondaryType, matchingTypeDescription } from '../../natspec'

const { Option } = Select;

type InputCreateHandle = (input: AbiInput, name: string, desc: string, required: boolean, secondary?: SecondaryType) => JSX.Element

const InputTextFromItem = (
    arg: AbiInput,
    regExp: RegExp,
    errorMessage: string,
    fieldName: string,
    desc: string,
    required: boolean,
    secondary?: SecondaryType
) => {
    const rules =
        [
            {
                validator: async (_: any, inputValue: string) => {
                    if (arg.type.endsWith('[]')) {
                        for (let subInput of inputValue.split('\n')) {
                            if (!regExp.test(subInput)) {
                                return Promise.reject(new Error(errorMessage))
                            }
                        }
                        return Promise.resolve();

                    } else {
                        if ((inputValue === undefined || inputValue.length <= 0) && !required) {
                            return Promise.resolve();
                        }
                        return !regExp.test(inputValue)
                            ? Promise.reject(new Error(errorMessage))
                            : Promise.resolve();
                    }
                },
            },
        ];

    return (
        <Form.Item
            name={fieldName}
            label={desc}
            rules={rules}
            required={required}
        >
            {
                arg.type.endsWith('[]')
                    ?
                    <div>
                        <Input.TextArea autoSize={true} />
                        <span style={{
                            color: 'blue'
                        }}>{`* 该字段类型为${arg.type.toUpperCase()},请在输入框中已换行分割每一个元素。`}</span>
                    </div>
                    : <Input placeholder="" addonAfter={arg.type.toUpperCase()} />
            }
        </Form.Item>
    )
}

const TypeInputText: InputCreateHandle = (arg: AbiInput, name: string, desc: string, required: boolean, secondary?: SecondaryType) => {
    return InputTextFromItem(arg, new RegExp('.+'), '该字段不能为空', name, desc, required, secondary)
}

const TypeInputNumber: InputCreateHandle = (arg: AbiInput, name: string, desc: string, required: boolean, secondary?: SecondaryType) => {
    return InputTextFromItem(arg, new RegExp('.+'), '该字段不能为空', name, desc, required, secondary)
}

const TypeInputBoolean: InputCreateHandle = (arg: AbiInput, name: string, desc: string, required: boolean, secondary?: SecondaryType) => {
    return (
        <Form.Item name={name} label={desc} required={required} >
            <Select
                placeholder="请选择"
                allowClear
            >
                <Option value="true">是</Option>
                <Option value="false">否</Option>
            </Select>
        </Form.Item>
    )
}

const TypeInputAddress: InputCreateHandle = (arg: AbiInput, name: string, desc: string, required: boolean, secondary?: SecondaryType) => {
    return InputTextFromItem(
        arg,
        new RegExp('^0x([0-9]|[a-z]|[A-Z]){40}$'), '请输入一个正确的十六进制地址，已0x开头',
        name,
        desc,
        required,
        secondary
    )
}

const TypeInputAmount: InputCreateHandle = (arg: AbiInput, name: string, desc: string, required: boolean, secondary?: SecondaryType) => {
    const unit = secondary!.toString().split(':')[1];
    return (
        <Form.Item name={name} label={desc} required={required}>
            <Input type="number" name={name} placeholder="" addonAfter={unit.toUpperCase()} />
        </Form.Item >
    )
}

const CreationsMapping = {
    "bool": TypeInputBoolean,
    "string": TypeInputText,
    "address": TypeInputAddress,
    "address[]": TypeInputAddress,
    "int256": TypeInputNumber,
    "uint256": {
        undefined: TypeInputNumber,
        '$amount:ether': TypeInputAmount
    }
} as any

function CreationInputElement(input: AbiInput, name: string, desc?: string): JSX.Element {

    const extDesc = matchingTypeDescription(desc)
    const lableText = input.name + (extDesc ? ` (${extDesc.content})` : '')

    try {
        if (typeof CreationsMapping[input.type] == 'function') {
            return CreationsMapping[input.type](input, name, lableText, !input.indexed, extDesc?.type)
        }
        else if (
            typeof CreationsMapping[input.type] == 'object' &&
            extDesc?.type
        ) {
            return CreationsMapping[input.type][extDesc!.type](input, name, lableText, !input.indexed, extDesc?.type)
        }

        throw Error("Can not find type")

    } catch (e) {
        return TypeInputText(input, name, lableText, !input.indexed, extDesc?.type)
    }
}

export default CreationInputElement;