// const presets = [
//     [
//         "@babel/evn",
//         {
//             targets: {
//                 edge: "17",
//                 firefox: "60",
//                 chrome: "67",
//                 safari: "11.1",
//             },
//             useBuiltIns: "usage",
//         },
//     ],
// ];

// module.exports = { presets };

module.exports = api => {
    return {
      plugins: [
        "@babel/plugin-proposal-nullish-coalescing-operator",
        "@babel/plugin-proposal-optional-chaining"
      ],
      presets: [
        [
          "@babel/preset-env",
          {
            useBuiltIns: "entry",
            // caller.target will be the same as the target option from webpack
            targets: api.caller(caller => caller && caller.target === "node")
              ? { node: "current" }
              : { chrome: "58", ie: "11" }
          }
        ]
      ]
    }
  }