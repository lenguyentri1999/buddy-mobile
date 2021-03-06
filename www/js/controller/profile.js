app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
app.controller('profilePageCtrl', ['$scope', '$state', '$localStorage', '$swipe',
  function ($scope, $state, $localStorage, $swipe){

    $scope.show = 1;
    $scope.successMessage = ""; //For uploading profile picture

    //Swipe transition
    // $scope.transitionRight = function() {
    //   $state.go('saved');
    // }

    //SIGN USER IN AUTOMATICALLY WITH EMAIL AND PASSWORD ON PROFILE PAGE
    var user = firebase.auth().currentUser;
    if (user===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }

    //DECLARING SOME VARIABLES
    if (user !== null)
  {
      var t1 = performance.now();
      var id = user.uid;
      var userRef = firebase.database().ref('users/'+id);
      var ref = firebase.database().ref("users/" + id);
      var storageRef = firebase.storage().ref("Avatars/"+id+"/avatar.jpg");

      userRef.on("value", function(snapshot) {
        $scope.userProfilePic = snapshot.val().pictureUrl;
        console.log($scope.userProfilePic);
        $state.go('profile');
      });
      var t2 = performance.now();
      console.log("Time it takes to update picture:" + (t2-t1) + " miliseconds.");


      //THIS ALLOW THE USER TO UPLOAD THEIR PROFILE PIC
      $scope.uploadFile = function(event){
        var file = event.target.files[0];
        $scope.successMessage="Updating...";
        $state.go('profile');

        storageRef.put(file).then(function(snapshot){
          console.log("File uploaded!");
          storageRef.getDownloadURL().then(function(url)
          {
            $scope.userProfilePic = url;
            userRef.update({pictureUrl: url});
            $scope.successMessage = "Picture uploaded!";
            $state.go('profile');

          });
        });

      };

      // DISPLAY THE USER INTEREST AND BIO
      var t3 = performance.now();
      userRef.once('value') .then(function(snapshot){
        $scope.name = snapshot.val().name;
        $scope.age = snapshot.val().age;
        $scope.description = snapshot.val().description;
        var interestStr = snapshot.val().interest;
        $scope.interestArr = interestStr.split(",");
        $scope.interestArr.splice(-1);
        $state.go('profile');
      });
      var t4 = performance.now();
      console.log("Time it takes to update user:" + (t4-t3) + " miliseconds.");

      $scope.updateBio = function($data) {
        ref.update({description: $data});
      };
  }
}]);
