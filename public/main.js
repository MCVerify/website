(function($, bootbox) {
  $(function() {
    new Clipboard('.btn')

    $('.service-delete-button').on('click', function(e) {
      e.preventDefault()
      var deleteURL = $(e.target).attr('href')
      var serviceName = $(e.target).parent().find('h4').text()

      bootbox.confirm('Are you sure you want to delete service ' + serviceName + '?', function(result) {
        if (result) {
          location.href = deleteURL
        }
      })
    })
  })
})(jQuery, bootbox)
