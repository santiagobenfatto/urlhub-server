import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid'

const shortAlias = () => {
    return newAlias =  nanoid(5)
}
const newId = () => {
    return newID =  uuidv4()
}

export { 
    shortAlias,
    newId
}
