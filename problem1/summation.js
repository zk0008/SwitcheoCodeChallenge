var sum_to_n_a = function(n) {
    // iterative for loop 
    let sum=0;
    for (let i=1; i<=n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_b = function(n) {
    // arithmetic formula
    let sum = (n * (n+1))/2;
    return sum;
};

var sum_to_n_c = function(n) {
    // recursive
    if (n == 1) {
        return 1;
    }
    return n + sum_to_n_c(n - 1);
};

console.log(sum_to_n_a(5),sum_to_n_b(5), sum_to_n_c(5))