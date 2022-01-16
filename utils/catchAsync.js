// Wrap async function
// Refer to Section 41 for recap
// Accepts function as an input. Execute it, but catches error if there is any.
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}