## Validations
    ## Dont have validations

    CLUSTER > PLOT > TREE [ TREE_NAME: 'null' ] 
        
        -> update(TREE_NAME, { value: 'Rome' })

    CLUSTER > PLOT > TREE [ TREE_NAME: 'Rome' ]

    ## inner validations error

    CLUSTER > PLOT > TREE [ TREE_DBH: null ] 
    TREE_DBH < 100 

        -> update(TREE_DBH, { value: 200 })

    CLUSTER > PLOT > TREE [ TREE_DBH: null ] 
    TREE_DBH < 100 
    Error TREE_DBH

    ## inner validations no error

    CLUSTER > PLOT > TREE [ TREE_DBH: null ] 
    TREE_DBH < 100 

        -> update(TREE_DBH, { value: 50 })

    CLUSTER > PLOT > TREE [ TREE_DBH: null ] 
    TREE_DBH < 100 
    Error null

    ## validation 


## Aplicability rules

    ## btwn sibilings

    Cluster > [ A_1, A_2 ]
    A_2 applicable if A_1 === 1

    -> update A_1: 2

    Cluster > [ A_1: 2, ~A_2~ ]
    A_2 applicable if A_1 === 1
    A_2 no applicable stored in node Parent

    ## applicability based on ancestors

    Cluster > Plot > Tree [ ta_1]
    ta_1 applicable if C1 === 1

    -> C1 (2)
    
    Cluster > Plot > Tree [ ~~ta_1~~]

     ## many applicability based on ancestors

    Cluster > Plot > Tree [ ta_1, ta_2 ]
    tree applicable if C1 === 1

    -> C1 (2)
    
    Cluster > Plot > Tree [ ~~ta_1~~, ~~ta_2~~]


## default values ->  this values should be reevaluated if it wastnt updated by the user