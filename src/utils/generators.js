import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid'

const shortAlias = () => {
    const newAlias =  nanoid(5)
    return newAlias
}
const newId = () => uuidv4()

export { 
    shortAlias,
    newId
}
